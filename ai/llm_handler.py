"""
LLM Handler for AI Chatbot
Handles communication with OpenAI and Google Gemini APIs
"""

import os
import json
import logging
from typing import Dict, Any, Optional
from django.conf import settings

logger = logging.getLogger(__name__)


class LLMHandler:
    """Handles LLM API calls for the AI chatbot"""
    
    def __init__(self):
        self.openai_api_key = getattr(settings, 'OPENAI_API_KEY', '')
        self.gemini_api_key = getattr(settings, 'GEMINI_API_KEY', '')
        self.ai_model = getattr(settings, 'AI_MODEL', 'gemini')
    
    def generate_response(self, message: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Generate AI response based on user message and context
        
        Args:
            message: User's input message
            context: Additional context (user info, conversation history, etc.)
            
        Returns:
            Dict containing response text and metadata
        """
        try:
            if self.ai_model.lower() == 'openai':
                return self._call_openai(message, context)
            elif self.ai_model.lower() == 'gemini':
                return self._call_gemini(message, context)
            else:
                return self._fallback_response(message)
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}")
            return {
                'response': "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
                'success': False,
                'error': str(e)
            }
    
    def _call_openai(self, message: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Call OpenAI API"""
        try:
            import openai
            
            if not self.openai_api_key:
                return self._fallback_response(message)
            
            openai.api_key = self.openai_api_key
            
            # Build system prompt
            system_prompt = self._build_system_prompt(context)
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message}
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            return {
                'response': response.choices[0].message.content,
                'success': True,
                'model': 'openai',
                'tokens_used': response.usage.total_tokens
            }
            
        except ImportError:
            logger.error("OpenAI library not installed")
            return self._fallback_response(message)
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            return self._fallback_response(message)
    
    def _call_gemini(self, message: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Call Google Gemini API"""
        try:
            import google.generativeai as genai
            
            if not self.gemini_api_key:
                return self._fallback_response(message)
            
            genai.configure(api_key=self.gemini_api_key)
            model = genai.GenerativeModel('gemini-pro')
            
            # Build prompt
            prompt = self._build_system_prompt(context) + "\n\nUser: " + message
            
            response = model.generate_content(prompt)
            
            return {
                'response': response.text,
                'success': True,
                'model': 'gemini',
                'candidates': len(response.candidates) if hasattr(response, 'candidates') else 1
            }
            
        except ImportError:
            logger.error("Google Generative AI library not installed")
            return self._fallback_response(message)
        except Exception as e:
            logger.error(f"Gemini API error: {str(e)}")
            return self._fallback_response(message)
    
    def _build_system_prompt(self, context: Dict[str, Any] = None) -> str:
        """Build system prompt for the AI"""
        base_prompt = """You are an AI assistant for Axpect SMS, a staff management system. You help users with:

1. Task Management: Create, assign, and track tasks
2. Attendance: Check attendance records and reports
3. Employee Information: Look up employee details
4. Job Cards: Manage job cards and assignments
5. Field Reports: Process and analyze field reports
6. General Questions: Answer questions about the system

Be helpful, professional, and concise. If you need to perform specific actions, mention what you can do."""
        
        if context:
            user_info = context.get('user_info', {})
            if user_info:
                base_prompt += f"\n\nCurrent user: {user_info.get('name', 'Unknown')} ({user_info.get('type', 'Unknown')})"
        
        return base_prompt
    
    def _fallback_response(self, message: str) -> Dict[str, Any]:
        """Fallback response when AI services are unavailable"""
        return {
            'response': "I'm currently unable to process your request. Please check your AI configuration or try again later.",
            'success': False,
            'model': 'fallback'
        }
    
    def process_field_report(self, report_text: str) -> Dict[str, Any]:
        """
        Process field report text and extract structured data
        
        Args:
            report_text: Raw field report text
            
        Returns:
            Dict containing extracted structured data
        """
        try:
            # This is a simplified version - in production, you'd want more sophisticated NLP
            prompt = f"""
            Analyze this field report and extract key information in JSON format:
            
            Report: {report_text}
            
            Extract:
            - customer_name
            - contact_person
            - outcome (order_taken, follow_up, etc.)
            - order_details (quantity, rate, amount)
            - payment_details (method, amount, status)
            - follow_up_required (yes/no)
            - follow_up_reason
            - follow_up_date
            - confidence_score (0-1)
            
            Return only valid JSON.
            """
            
            if self.ai_model.lower() == 'openai':
                response = self._call_openai(prompt)
            elif self.ai_model.lower() == 'gemini':
                response = self._call_gemini(prompt)
            else:
                return self._fallback_field_report()
            
            if response.get('success'):
                try:
                    # Try to parse JSON from response
                    json_start = response['response'].find('{')
                    json_end = response['response'].rfind('}') + 1
                    if json_start != -1 and json_end > json_start:
                        json_str = response['response'][json_start:json_end]
                        structured_data = json.loads(json_str)
                        return {
                            'success': True,
                            'structured_data': structured_data,
                            'confidence_score': structured_data.get('confidence_score', 0.8)
                        }
                except json.JSONDecodeError:
                    pass
            
            return self._fallback_field_report()
            
        except Exception as e:
            logger.error(f"Error processing field report: {str(e)}")
            return self._fallback_field_report()
    
    def _fallback_field_report(self) -> Dict[str, Any]:
        """Fallback for field report processing"""
        return {
            'success': False,
            'structured_data': {
                'customer_name': 'Unknown',
                'contact_person': 'Unknown',
                'outcome': 'Unknown',
                'order_details': {},
                'payment_details': {},
                'follow_up_required': False,
                'confidence_score': 0.0
            },
            'error': 'Unable to process field report'
        }
    
    def process_chat(self, message: str, user_context: Dict[str, Any] = None) -> tuple:
        """
        Process chat message and extract intent and entities
        
        Args:
            message: User's message
            user_context: User information and permissions
            
        Returns:
            Tuple of (response_text, action_data)
        """
        try:
            # Detect intent from message
            intent_data = self._detect_intent(message, user_context)
            
            if not intent_data:
                return self._generate_help_response(user_context), None
            
            intent = intent_data.get('intent')
            entities = intent_data.get('entities', {})
            
            # Generate contextual response
            if intent == 'help':
                return self._generate_help_response(user_context), None
            elif intent == 'greeting':
                return self._generate_greeting_response(user_context), None
            elif intent in ['create_task', 'assign_task']:
                return self._generate_task_response(entities, user_context), {
                    'action': 'create_task',
                    'parameters': entities
                }
            elif intent == 'get_tasks':
                return self._generate_task_list_response(entities, user_context), {
                    'action': 'get_tasks',
                    'parameters': entities
                }
            elif intent == 'get_attendance':
                return self._generate_attendance_response(entities, user_context), {
                    'action': 'get_attendance',
                    'parameters': entities
                }
            elif intent == 'get_employee_info':
                return self._generate_employee_info_response(entities, user_context), {
                    'action': 'get_employee_info',
                    'parameters': entities
                }
            elif intent == 'list_employees':
                return self._generate_employee_list_response(user_context), {
                    'action': 'list_employees',
                    'parameters': {}
                }
            elif intent == 'get_team_info':
                return self._generate_team_info_response(entities, user_context), {
                    'action': 'get_team_info',
                    'parameters': entities
                }
            else:
                return "I understand you're asking about " + intent + ", but I'm not sure how to help with that yet. Try asking 'help' to see what I can do.", None
                
        except Exception as e:
            logger.error(f"Error processing chat: {str(e)}")
            return "I'm sorry, I had trouble understanding that. Could you try rephrasing your question?", None
    
    def _detect_intent(self, message: str, user_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Detect user intent from message"""
        message_lower = message.lower()
        
        # Greeting patterns
        if any(word in message_lower for word in ['hello', 'hi ', 'hey', 'good morning', 'good afternoon']):
            return {'intent': 'greeting', 'entities': {}}
        
        # Help patterns
        if any(word in message_lower for word in ['help', 'what can you do', 'how to', 'guide']):
            return {'intent': 'help', 'entities': {}}
        
        # Task creation patterns
        if any(phrase in message_lower for phrase in ['assign a task', 'create task', 'assign task', 'give task', 'new task']):
            entities = self._extract_task_entities(message, user_context)
            return {'intent': 'create_task', 'entities': entities}
        
        # Task listing patterns
        if any(phrase in message_lower for phrase in ['my tasks', 'show tasks', 'list tasks', 'pending tasks', 'view tasks']):
            entities = self._extract_task_query_entities(message, user_context)
            return {'intent': 'get_tasks', 'entities': entities}
        
        # Attendance patterns
        if any(phrase in message_lower for phrase in ['my attendance', 'show attendance', 'attendance report', 'attendance record']):
            entities = self._extract_attendance_entities(message, user_context)
            return {'intent': 'get_attendance', 'entities': entities}
        
        # Employee info patterns
        if any(phrase in message_lower for phrase in ['employee details', 'employee info', 'show employee', 'about employee']):
            entities = self._extract_employee_entities(message, user_context)
            return {'intent': 'get_employee_info', 'entities': entities}
        
        # List employees
        if any(phrase in message_lower for phrase in ['all employees', 'list employees', 'show all staff', 'team members']):
            return {'intent': 'list_employees', 'entities': {}}
        
        # Team info patterns
        if any(phrase in message_lower for phrase in ['team info', 'team details', 'show team', 'department info']):
            entities = self._extract_team_entities(message, user_context)
            return {'intent': 'get_team_info', 'entities': entities}
        
        return None
    
    def _extract_task_entities(self, message: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Extract task-related entities from message"""
        import re
        from datetime import datetime, timedelta
        
        entities = {}
        
        # Extract employee name (simple pattern matching)
        # Pattern: "assign task to [name]" or "give [name] a task"
        to_pattern = r'(?:to|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)'
        match = re.search(to_pattern, message, re.IGNORECASE)
        if match:
            entities['employee_name'] = match.group(1).strip()
        
        # Extract task description
        # Pattern: after "to [do/complete/finish]"
        desc_pattern = r'to\s+(?:do|complete|finish|work on|handle)\s+(.+?)(?:\.|$|by|before)'
        match = re.search(desc_pattern, message, re.IGNORECASE)
        if match:
            entities['description'] = match.group(1).strip()
        else:
            # Fallback: everything after the task action verb
            if 'to ' in message.lower():
                parts = message.lower().split('to ', 1)
                if len(parts) > 1:
                    entities['description'] = parts[1].strip()
        
        # Extract priority
        if any(word in message.lower() for word in ['urgent', 'asap', 'immediately']):
            entities['priority'] = 'urgent'
        elif any(word in message.lower() for word in ['high priority', 'important']):
            entities['priority'] = 'high'
        elif any(word in message.lower() for word in ['low priority', 'when possible']):
            entities['priority'] = 'low'
        else:
            entities['priority'] = 'medium'
        
        # Extract due date (simple patterns)
        if 'today' in message.lower():
            entities['due_date'] = datetime.now().date().isoformat()
        elif 'tomorrow' in message.lower():
            entities['due_date'] = (datetime.now() + timedelta(days=1)).date().isoformat()
        elif 'next week' in message.lower():
            entities['due_date'] = (datetime.now() + timedelta(days=7)).date().isoformat()
        
        return entities
    
    def _extract_task_query_entities(self, message: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Extract entities for task queries"""
        entities = {'user_id': user_context.get('user_id')}
        
        # Check if user wants their own tasks or someone else's
        if any(word in message.lower() for word in ['my ', 'my tasks', 'i have']):
            entities['self_query'] = True
        
        return entities
    
    def _extract_attendance_entities(self, message: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Extract attendance-related entities"""
        import re
        from datetime import datetime, timedelta
        
        entities = {}
        
        # Check if it's self-query
        if any(word in message.lower() for word in ['my attendance', 'my record']):
            entities['self_query'] = True
        else:
            # Try to extract employee name
            name_pattern = r'(?:attendance of|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)'
            match = re.search(name_pattern, message, re.IGNORECASE)
            if match:
                entities['employee_name'] = match.group(1).strip()
        
        # Extract time period
        if 'this month' in message.lower():
            today = datetime.now()
            entities['start_date'] = today.replace(day=1).date().isoformat()
            entities['end_date'] = today.date().isoformat()
        elif 'last month' in message.lower():
            today = datetime.now()
            first_of_month = today.replace(day=1)
            last_month = first_of_month - timedelta(days=1)
            entities['start_date'] = last_month.replace(day=1).date().isoformat()
            entities['end_date'] = last_month.date().isoformat()
        elif 'this week' in message.lower():
            today = datetime.now()
            start = today - timedelta(days=today.weekday())
            entities['start_date'] = start.date().isoformat()
            entities['end_date'] = today.date().isoformat()
        else:
            # Default to last 30 days
            today = datetime.now()
            entities['start_date'] = (today - timedelta(days=30)).date().isoformat()
            entities['end_date'] = today.date().isoformat()
        
        return entities
    
    def _extract_employee_entities(self, message: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Extract employee-related entities"""
        import re
        
        entities = {}
        
        # Extract employee name
        name_pattern = r'(?:employee|staff|about)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)'
        match = re.search(name_pattern, message, re.IGNORECASE)
        if match:
            entities['employee_name'] = match.group(1).strip()
        
        return entities
    
    def _extract_team_entities(self, message: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Extract team-related entities"""
        import re
        
        entities = {}
        
        # Extract team/department name
        team_pattern = r'(?:team|department|division)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)'
        match = re.search(team_pattern, message, re.IGNORECASE)
        if match:
            entities['team_name'] = match.group(1).strip()
        
        return entities
    
    def _generate_help_response(self, user_context: Dict[str, Any]) -> str:
        """Generate help response"""
        permissions = user_context.get('permissions', {})
        
        response = "👋 Hi! I'm your AI assistant. Here's what I can help you with:\n\n"
        response += "🔹 **Task Management**:\n"
        if permissions.get('can_manage_tasks'):
            response += "  • Assign tasks: 'Assign a task to John to review the report'\n"
        response += "  • View your tasks: 'Show my tasks' or 'My pending tasks'\n\n"
        
        response += "🔹 **Attendance**:\n"
        response += "  • Check your attendance: 'Show my attendance'\n"
        if permissions.get('can_view_all_attendance'):
            response += "  • Check staff attendance: 'Show attendance of Ali for this month'\n\n"
        
        response += "🔹 **Employee Information**:\n"
        response += "  • View employee details: 'Show employee details of Sarah'\n"
        response += "  • List all employees: 'List all employees'\n"
        if permissions.get('can_manage_employees'):
            response += "  • Team information: 'Show team info of marketing'\n\n"
        
        response += "Try any of these commands, or just ask me in natural language!"
        return response
    
    def _generate_greeting_response(self, user_context: Dict[str, Any]) -> str:
        """Generate greeting response"""
        name = user_context.get('name', 'there')
        return f"👋 Hello {name}! How can I help you today? I can assist with tasks, attendance, and employee information. Just ask!"
    
    def _generate_task_response(self, entities: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Generate response for task creation"""
        employee_name = entities.get('employee_name', 'the employee')
        description = entities.get('description', 'the task')
        return f"I'll assign a task to {employee_name} to {description}. Let me process that..."
    
    def _generate_task_list_response(self, entities: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Generate response for task listing"""
        return "Let me fetch your tasks..."
    
    def _generate_attendance_response(self, entities: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Generate response for attendance query"""
        if entities.get('self_query'):
            return "Let me retrieve your attendance records..."
        else:
            employee_name = entities.get('employee_name', 'the employee')
            return f"Let me fetch attendance records for {employee_name}..."
    
    def _generate_employee_info_response(self, entities: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Generate response for employee info"""
        employee_name = entities.get('employee_name', 'the employee')
        return f"Let me look up information for {employee_name}..."
    
    def _generate_employee_list_response(self, user_context: Dict[str, Any]) -> str:
        """Generate response for employee listing"""
        return "Let me retrieve the list of all employees..."
    
    def _generate_team_info_response(self, entities: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Generate response for team info"""
        team_name = entities.get('team_name', 'the team')
        return f"Let me fetch information about {team_name}..."