"""
LLM Handler for AI Chatbot
Supports both OpenAI GPT and Google Gemini APIs
"""

import json
import logging
import os
from typing import Dict, Any, Optional, Tuple
from django.conf import settings

logger = logging.getLogger(__name__)

class LLMHandler:
    """Handles communication with AI models (OpenAI GPT or Google Gemini)"""
    
    def __init__(self):
        self.openai_api_key = getattr(settings, 'OPENAI_API_KEY', None)
        self.gemini_api_key = os.environ.get('GEMINI_API_KEY', None)
        self.preferred_model = os.environ.get('AI_MODEL', 'openai')  # 'openai' or 'gemini'
        
    def _get_system_prompt(self) -> str:
        """Get the system prompt for the AI assistant"""
        return """You are an AI assistant for a Staff Management System with enhanced field report processing capabilities. You can help with:

1. TASK MANAGEMENT:
   - Create tasks: "Assign a task to [employee] to [description]"
   - View tasks: "Show tasks for [employee]" or "What are my tasks?"
   - Update task status: "Mark task [id] as completed"

2. ATTENDANCE MANAGEMENT:
   - Check attendance: "Show attendance for [employee]" or "Check my attendance"
   - View attendance reports: "Show attendance report for [date/period]"

3. EMPLOYEE INFORMATION:
   - Get employee info: "Show details for [employee]"
   - List employees: "Show all employees" or "List team members"

4. FIELD REPORT PROCESSING (NEW):
   - Process field reports: "Process field report for job card [id]"
   - Analyze performance: "Analyze job performance" or "Show performance for employee [id]"
   - Extract business data from field visit notes using AI

5. GENERAL QUERIES:
   - Answer questions about the system
   - Provide help and guidance

IMPORTANT INSTRUCTIONS:
- Always respond in a helpful, professional tone
- If you need to perform an action, include a JSON object with the action details
- For actions, use this format: {"action": "action_name", "parameters": {...}}
- Available actions: create_task, get_tasks, get_attendance, get_employee_info, list_employees, process_field_report, analyze_job_performance
- If you cannot perform an action due to permissions, explain why
- Always confirm successful actions with a friendly message
- For field report processing, ensure the job card has notes/text to process

Examples:
User: "Assign a task to Ali to complete the project report"
Response: I'll create that task for Ali right away.
{"action": "create_task", "parameters": {"employee_name": "Ali", "description": "complete the project report", "priority": "medium"}}

User: "Show my attendance"
Response: Let me check your attendance records.
{"action": "get_attendance", "parameters": {"employee_name": "current_user"}}
"""

    def _extract_action_from_response(self, response: str) -> Tuple[str, Optional[Dict]]:
        """Extract action and parameters from AI response"""
        try:
            # Look for JSON in the response
            start_idx = response.find('{')
            end_idx = response.rfind('}') + 1
            
            if start_idx != -1 and end_idx > start_idx:
                json_str = response[start_idx:end_idx]
                action_data = json.loads(json_str)
                
                if 'action' in action_data:
                    # Remove the JSON from the response text
                    clean_response = response[:start_idx] + response[end_idx:]
                    clean_response = clean_response.strip()
                    
                    return clean_response, action_data
            
            return response, None
            
        except (json.JSONDecodeError, ValueError) as e:
            logger.warning(f"Failed to extract action from response: {e}")
            return response, None

    def _call_openai(self, message: str, user_context: Dict) -> str:
        """Call OpenAI GPT API"""
        try:
            import openai
            
            openai.api_key = self.openai_api_key
            
            messages = [
                {"role": "system", "content": self._get_system_prompt()},
                {"role": "user", "content": f"User context: {json.dumps(user_context)}\n\nUser message: {message}"}
            ]
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=500,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            return "I'm sorry, I'm having trouble processing your request right now. Please try again later."

    def _call_gemini(self, message: str, user_context: Dict) -> str:
        """Call Google Gemini API"""
        try:
            import google.generativeai as genai
            
            genai.configure(api_key=self.gemini_api_key)
            
            # Try different model names in order of preference
            model_names = [
                'gemini-1.5-flash-latest',
                'gemini-1.5-flash', 
                'gemini-pro',
                'models/gemini-1.5-flash-latest',
                'models/gemini-1.5-flash',
                'models/gemini-pro'
            ]
            
            prompt = f"{self._get_system_prompt()}\n\nUser context: {json.dumps(user_context)}\n\nUser message: {message}"
            
            last_error = None
            for model_name in model_names:
                try:
                    model = genai.GenerativeModel(model_name)
                    response = model.generate_content(prompt)
                    if response and response.text:
                        logger.info(f"Successfully used Gemini model: {model_name}")
                        return response.text.strip()
                except Exception as e:
                    last_error = e
                    logger.warning(f"Failed to use model {model_name}: {e}")
                    continue
            
            # If all models failed, raise the last error
            raise last_error if last_error else Exception("No working Gemini model found")
            
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            # Return fallback response instead of generic error
            return self._fallback_response(message, user_context)

    def process_chat(self, message: str, user_context: Dict) -> Tuple[str, Optional[Dict]]:
        """
        Process chat message and return response with optional action
        
        Args:
            message: User's message
            user_context: Dictionary containing user info (name, role, permissions, etc.)
            
        Returns:
            Tuple of (response_text, action_dict)
        """
        try:
            # Choose AI model based on configuration and availability
            if self.preferred_model == 'gemini' and self.gemini_api_key:
                response = self._call_gemini(message, user_context)
            elif self.openai_api_key:
                response = self._call_openai(message, user_context)
            else:
                # Fallback to rule-based responses if no API keys available
                response = self._fallback_response(message, user_context)
            
            # Extract action from response
            clean_response, action = self._extract_action_from_response(response)
            
            return clean_response, action
            
        except Exception as e:
            logger.error(f"Error processing chat: {e}")
            return "I apologize, but I encountered an error while processing your request. Please try again.", None

    def _fallback_response(self, message: str, user_context: Dict) -> str:
        """Fallback rule-based responses when AI APIs are not available"""
        message_lower = message.lower()
        
        # Greeting patterns
        if any(keyword in message_lower for keyword in ['hello', 'hi', 'hey', 'what can you help']):
            return """👋 Hello! I'm your AI assistant for the Staff Management System. 

I can help you with:
🔹 **Task Management**: Create, assign, and track tasks
🔹 **Attendance**: Check attendance records and reports  
🔹 **Employee Info**: View employee details and team information

Try these commands:
- "Show my tasks"
- "Show my attendance" 
- "List all employees"
- "Help" for more options"""

        # Task-related patterns
        elif any(keyword in message_lower for keyword in ['task', 'assign']):
            if 'show' in message_lower or 'list' in message_lower:
                if 'all' in message_lower or 'everyone' in message_lower:
                    return """I'll show you all tasks in the system.
{"action": "list_all_tasks", "parameters": {}}"""
                else:
                    return """I'll check your tasks right away.
{"action": "get_tasks", "parameters": {"employee_name": "current_user"}}"""
            elif 'assign' in message_lower or 'create' in message_lower:
                return """I can help you create tasks! 

Example: "Assign a task to John to review the monthly report"

For now, please use the sidebar menu to create tasks manually, or provide a valid API key for full AI functionality."""
        
        # Attendance patterns
        elif any(keyword in message_lower for keyword in ['attendance', 'check in', 'check out']):
            if 'all' in message_lower or 'everyone' in message_lower or 'staff' in message_lower:
                return """I'll show you all staff attendance records.
{"action": "list_all_attendance", "parameters": {}}"""
            else:
                return """Let me check your attendance records.
{"action": "get_attendance", "parameters": {"employee_name": "current_user"}}"""

        # Employee info patterns
        elif any(keyword in message_lower for keyword in ['employee', 'list', 'team']):
            return """I'll get the employee information for you.
{"action": "list_employees", "parameters": {}}"""

        # General help
        elif any(keyword in message_lower for keyword in ['help', 'what can you do', 'commands']):
            return """🤖 **AI Assistant Help**

**Available Commands:**
- "Show my tasks" - View your assigned tasks
- "List all tasks" - View all tasks in the system (admins)
- "Show tasks for [employee name]" - View specific employee's tasks
- "Show my attendance" - Check your attendance records
- "Show all staff attendance" - View all employees' attendance (admins)
- "Show attendance for [employee name]" - View specific employee's attendance
- "List all employees" - View team members
- "Show details for [employee name]" - Get employee info

**Task Management:**
- "Assign a task to [name] to [description]" (requires API key)
- "Show all tasks" - See all tasks you've created and assigned

**Admin Features:**
- Full access to all employee data
- Create and manage tasks for any employee
- View system-wide reports and analytics

**Quick Actions:** Use the buttons below for common tasks! 📋 📅 👥"""

        else:
            return """I'm here to help with your staff management needs! 

Try saying:
- "Show my tasks"
- "Show my attendance" 
- "List all employees"
- "Help" for more options

**Note:** Some advanced features require a valid API key. Contact your administrator for full AI functionality."""


def get_llm_handler() -> LLMHandler:
    """Get a configured LLM handler instance"""
    return LLMHandler()
