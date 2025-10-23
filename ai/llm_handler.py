"""
LLM Handler for AI Chatbot
Handles communication with OpenAI and Google Gemini APIs
"""

import os
import json
import logging
import time
from typing import Dict, Any, Optional
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)


class LLMHandler:
    """Handles LLM API calls for the AI chatbot"""
    
    def __init__(self):
        self.openai_api_key = getattr(settings, 'OPENAI_API_KEY', '')
        self.gemini_api_key = getattr(settings, 'GEMINI_API_KEY', '')
        self.ai_model = getattr(settings, 'AI_MODEL', 'gemini')
        self.rate_limit_key = 'gemini_api_calls'
        self.rate_limit_window = 60  # 60 seconds
        self.rate_limit_max_calls = 10  # Conservative limit
    
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
            if context and context.get('system_message'):
                system_prompt = context['system_message']
            else:
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
            model = genai.GenerativeModel('gemini-2.0-flash')
            
            # Build prompt
            if context and context.get('system_message'):
                prompt = context['system_message'] + "\n\n" + message
            else:
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
        base_prompt = """You are an AI assistant for Axpect SMS staff management system. 

Give SHORT, DIRECT responses. No explanations or thinking out loud. Maximum 2 sentences.

Available actions:
- Tasks: Create, assign, track
- Attendance: Check records
- Employees: Look up details
- Job Cards: Manage assignments
- Field Reports: Process data"""
        
        if context:
            user_info = context.get('user_info', {})
            if user_info:
                base_prompt += f"\n\nUser: {user_info.get('name', 'Unknown')} ({user_info.get('type', 'Unknown')})"
                
                # Add admin-specific capabilities
                user_type = user_info.get('user_type', '')
                is_superuser = user_info.get('is_superuser', False)
                if user_type == '1' or is_superuser:
                    base_prompt += "\n\nAdmin access: Full job card CRUD, all employees, all attendance."
        
        return base_prompt
    
    def get_completion(self, prompt: str, system_message: str = None, max_tokens: int = 200, temperature: float = 0.3) -> str:
        """
        Get completion from the configured AI model
        
        Args:
            prompt: The user prompt
            system_message: Optional system message
            max_tokens: Maximum tokens to generate
            temperature: Temperature for generation
            
        Returns:
            Generated text response
        """
        try:
            if self.ai_model.lower() == 'openai':
                response = self._call_openai(prompt, {'system_message': system_message})
            elif self.ai_model.lower() == 'gemini':
                response = self._call_gemini(prompt, {'system_message': system_message})
            else:
                response = self._fallback_response(prompt)
            
            if response.get('success'):
                return response.get('response', '')
            else:
                logger.error(f"AI completion failed: {response.get('error', 'Unknown error')}")
                return "I'm sorry, I'm having trouble processing your request right now."
                
        except Exception as e:
            logger.error(f"Error in get_completion: {str(e)}")
            return "I'm sorry, I encountered an error while processing your request."
    
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
    
    def _resolve_context_references(self, message: str, user_context: Dict[str, Any] = None) -> str:
        """
        Resolve pronouns and context references in the message
        
        Args:
            message: Original message
            user_context: User context including conversation history
            
        Returns:
            Resolved message with context references replaced
        """
        if not user_context or 'conversation_history' not in user_context:
            return message
        
        history = user_context.get('conversation_history', [])
        if not history:
            return message
        
        # Look for recent entities in conversation history
        recent_entities = {}
        for msg in reversed(history[-5:]):  # Look at last 5 messages
            if msg.get('entities'):
                recent_entities.update(msg['entities'])
        
        # Common pronoun patterns and their resolutions
        resolved_message = message
        
        # Handle "it", "that", "this" for job cards
        if any(pronoun in message.lower() for pronoun in ['it', 'that', 'this']):
            if 'jobcard_id' in recent_entities:
                jobcard_id = recent_entities['jobcard_id']
                if 'delete it' in message.lower():
                    resolved_message = message.replace('it', f'job card {jobcard_id}')
                elif 'update it' in message.lower():
                    resolved_message = message.replace('it', f'job card {jobcard_id}')
                elif 'show it' in message.lower():
                    resolved_message = message.replace('it', f'job card {jobcard_id}')
        
        # Handle "the job card", "the task", etc.
        if 'the job card' in message.lower() and 'jobcard_id' in recent_entities:
            jobcard_id = recent_entities['jobcard_id']
            resolved_message = message.replace('the job card', f'job card {jobcard_id}')
        
        if 'the task' in message.lower() and 'task_id' in recent_entities:
            task_id = recent_entities['task_id']
            resolved_message = message.replace('the task', f'task {task_id}')
        
        # Handle "first one", "second one", etc.
        if 'first one' in message.lower() or 'second one' in message.lower():
            # Look for recent list operations in conversation history
            for msg in reversed(history[-3:]):
                if msg.get('action_executed') == 'list_employees' and msg.get('action_result'):
                    employees = msg['action_result'].get('employees', [])
                    if employees:
                        if 'first one' in message.lower():
                            first_employee = employees[0]
                            resolved_message = message.replace('first one', first_employee.get('name', 'first employee'))
                        elif 'second one' in message.lower() and len(employees) > 1:
                            second_employee = employees[1]
                            resolved_message = message.replace('second one', second_employee.get('name', 'second employee'))
                        break
        
        # Handle "the first employee", "the second employee", etc.
        if 'the first employee' in message.lower():
            for msg in reversed(history[-3:]):
                if msg.get('action_executed') == 'list_employees' and msg.get('action_result'):
                    employees = msg['action_result'].get('employees', [])
                    if employees:
                        first_employee = employees[0]
                        resolved_message = message.replace('the first employee', first_employee.get('name', 'the first employee'))
                        break
        
        # Handle "them" referring to recently mentioned employees
        if 'them' in message.lower() and 'employee' in message.lower():
            for msg in reversed(history[-3:]):
                if msg.get('action_executed') == 'list_employees' and msg.get('action_result'):
                    employees = msg['action_result'].get('employees', [])
                    if employees:
                        # Use the first employee as default
                        first_employee = employees[0]
                        resolved_message = message.replace('them', first_employee.get('name', 'the employee'))
                        break
        
        return resolved_message
    
    def _check_rate_limit(self) -> bool:
        """Check if we're within rate limits for API calls"""
        current_time = int(time.time())
        window_start = current_time - self.rate_limit_window
        
        # Get current call count from cache
        call_times = cache.get(self.rate_limit_key, [])
        
        # Remove old calls outside the window
        call_times = [call_time for call_time in call_times if call_time > window_start]
        
        # Check if we're under the limit
        if len(call_times) >= self.rate_limit_max_calls:
            return False
        
        # Add current call
        call_times.append(current_time)
        cache.set(self.rate_limit_key, call_times, self.rate_limit_window)
        
        return True
    
    def process_chat(self, message: str, user_context: Dict[str, Any] = None) -> tuple:
        """
        Process chat message and extract intent and entities
        
        Args:
            message: User's message
            user_context: User information and permissions (including conversation_history)
            
        Returns:
            Tuple of (response_text, action_data)
        """
        try:
            # Resolve context references (pronouns, "it", "that", etc.)
            resolved_message = self._resolve_context_references(message, user_context)
            
            # Debug logging
            logger.info(f"Processing message: '{message}' -> resolved: '{resolved_message}'")
            
            # Detect intent from resolved message
            intent_data = self._detect_intent(resolved_message, user_context)
            
            # Debug logging
            if intent_data:
                logger.info(f"Intent detected: {intent_data}")
            else:
                logger.info("No intent detected - will use Gemini API")
            
            if not intent_data:
                # No intent detected, use Gemini API for general questions
                # Check rate limit first (temporarily disabled for testing)
                # if not self._check_rate_limit():
                #     return "I'm currently processing many requests. Please wait a moment and try again.", None
                return self._generate_gemini_response(resolved_message, user_context), None
            
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
            elif intent == 'create_jobcard':
                return self._generate_jobcard_response(entities, user_context), {
                    'action': 'create_jobcard',
                    'parameters': entities
                }
            elif intent == 'get_jobcard':
                return self._generate_jobcard_query_response(entities, user_context), {
                    'action': 'get_jobcard',
                    'parameters': entities
                }
            elif intent == 'update_jobcard':
                return self._generate_jobcard_query_response(entities, user_context), {
                    'action': 'update_jobcard',
                    'parameters': entities
                }
            elif intent == 'delete_jobcard':
                return self._generate_jobcard_query_response(entities, user_context), {
                    'action': 'delete_jobcard',
                    'parameters': entities
                }
            elif intent == 'list_jobcards':
                return self._generate_jobcard_list_response(entities, user_context), {
                    'action': 'list_jobcards',
                    'parameters': entities
                }
            else:
                # For unrecognized intents, use Gemini API to generate a response
                return self._generate_gemini_response(message, user_context), None
                
        except Exception as e:
            logger.error(f"Error processing chat: {str(e)}")
            return "I'm sorry, I had trouble understanding that. Could you try rephrasing your question?", None
    
    def _detect_intent(self, message: str, user_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Detect user intent from message"""
        message_lower = message.lower()
        
        # Greeting patterns
        if any(word in message_lower for word in ['hello', 'hi ', 'hey', 'good morning', 'good afternoon']):
            return {'intent': 'greeting', 'entities': {}}
        
        # Help patterns - more specific to avoid false matches
        help_patterns = [
            'help me',
            'what can you do',
            'how to use',
            'guide me',
            'show me how',
            'what are your capabilities',
            'what do you do',
            'how can you help'
        ]
        if any(pattern in message_lower for pattern in help_patterns):
            return {'intent': 'help', 'entities': {}}
        
        # Task creation patterns (map to job card creation since they're the same)
        if any(phrase in message_lower for phrase in ['assign a task', 'create task', 'assign task', 'give task', 'new task']):
            entities = self._extract_jobcard_entities(message, user_context)  # Use job card entity extraction
            return {'intent': 'create_jobcard', 'entities': entities}  # Map to job card intent
        
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
        
        # Job card creation patterns (check FIRST before employee patterns)
        jobcard_create_patterns = [
            'create job card', 'new job card', 'add job card', 'make job card',
            'create a job card', 'new a job card', 'add a job card', 'make a job card',
            'create jobcard', 'new jobcard', 'add jobcard', 'make jobcard',
            'create job card for', 'assign job card', 'job card for all employees',
            'create job card to all', 'send job card to all', 'create a random job card',
            # Also handle "task" as synonym for job card
            'create task', 'new task', 'add task', 'make task', 'create a task',
            'create random task', 'assign task', 'task for all employees',
            'create task for', 'send task to all', 'create a random task'
        ]
        if any(phrase in message_lower for phrase in jobcard_create_patterns):
            entities = self._extract_jobcard_entities(message, user_context)
            return {'intent': 'create_jobcard', 'entities': entities}
        
        # List employees (check AFTER job card patterns)
        if any(phrase in message_lower for phrase in ['all employees', 'list employees', 'show all staff', 'team members']):
            return {'intent': 'list_employees', 'entities': {}}
        
        # Team info patterns
        if any(phrase in message_lower for phrase in ['team info', 'team details', 'show team', 'department info']):
            entities = self._extract_team_entities(message, user_context)
            return {'intent': 'get_team_info', 'entities': entities}
        
        # Job card viewing patterns
        if any(phrase in message_lower for phrase in ['show job card', 'get job card', 'view job card', 'job card details']):
            entities = self._extract_jobcard_query_entities(message, user_context)
            return {'intent': 'get_jobcard', 'entities': entities}
        
        # Job card update patterns
        if any(phrase in message_lower for phrase in ['update job card', 'modify job card', 'change job card', 'edit job card']):
            entities = self._extract_jobcard_query_entities(message, user_context)
            return {'intent': 'update_jobcard', 'entities': entities}
        
        # Job card deletion patterns
        if any(phrase in message_lower for phrase in ['delete job card', 'remove job card', 'cancel job card']):
            entities = self._extract_jobcard_query_entities(message, user_context)
            return {'intent': 'delete_jobcard', 'entities': entities}
        
        # Job card listing patterns
        if any(phrase in message_lower for phrase in ['list job cards', 'show all job cards', 'all job cards', 'job cards list']):
            entities = self._extract_jobcard_query_entities(message, user_context)
            return {'intent': 'list_jobcards', 'entities': entities}
        
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
    
    def _extract_jobcard_entities(self, message: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Extract job card creation/update details"""
        import re
        from datetime import datetime, timedelta
        
        entities = {}
        
        # Extract employee name or special cases
        if 'all employees' in message.lower() or 'to all' in message.lower():
            entities['employee_name'] = 'all_employees'
        elif 'random' in message.lower():
            entities['employee_name'] = 'random'
        else:
            to_pattern = r'(?:to|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)'
            match = re.search(to_pattern, message, re.IGNORECASE)
            if match:
                entities['employee_name'] = match.group(1).strip()
        
        # Extract job description from quotes or specific text
        if "'" in message or '"' in message:
            # Extract text between quotes
            quote_pattern = r'[\'"]([^\'"]+)[\'"]'
            match = re.search(quote_pattern, message)
            if match:
                entities['description'] = match.group(1).strip()
        
        # Extract job card type
        type_patterns = {
            'CALL': r'(?:call|calling|tele-call)',
            'VISIT': r'(?:visit|meeting|field)',
            'SAMPLE': r'(?:sample|delivery)',
            'COLLECTION': r'(?:collection|collect)',
            'FOLLOWUP': r'(?:follow.?up|follow.?up)'
        }
        
        for job_type, pattern in type_patterns.items():
            if re.search(pattern, message, re.IGNORECASE):
                entities['type'] = job_type
                break
        
        # Extract priority
        priority_patterns = {
            'HIGH': r'(?:high|urgent|priority)',
            'MEDIUM': r'(?:medium|normal)',
            'LOW': r'(?:low|minor)'
        }
        
        for priority, pattern in priority_patterns.items():
            if re.search(pattern, message, re.IGNORECASE):
                entities['priority'] = priority
                break
        
        # Extract status
        status_patterns = {
            'PENDING': r'(?:pending|new)',
            'IN_PROGRESS': r'(?:progress|ongoing|working)',
            'COMPLETED': r'(?:completed|done|finished)',
            'CANCELLED': r'(?:cancelled|canceled)'
        }
        
        for status, pattern in status_patterns.items():
            if re.search(pattern, message, re.IGNORECASE):
                entities['status'] = status
                break
        
        # Extract description
        desc_pattern = r'(?:for|about|regarding)\s+(.+?)(?:\.|$|for|to)'
        match = re.search(desc_pattern, message, re.IGNORECASE)
        if match:
            entities['description'] = match.group(1).strip()
        else:
            # Fallback: everything after common verbs
            fallback_patterns = [
                r'(?:create|make|add)\s+(?:job card|jobcard)\s+(?:for|to|about)\s+(.+)',
                r'(?:job card|jobcard)\s+(?:for|about|regarding)\s+(.+)'
            ]
            for pattern in fallback_patterns:
                match = re.search(pattern, message, re.IGNORECASE)
                if match:
                    entities['description'] = match.group(1).strip()
                    break
        
        # Extract customer name
        customer_pattern = r'(?:customer|client)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)'
        match = re.search(customer_pattern, message, re.IGNORECASE)
        if match:
            entities['customer_name'] = match.group(1).strip()
        
        # Extract city name
        city_pattern = r'(?:in|at|city)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)'
        match = re.search(city_pattern, message, re.IGNORECASE)
        if match:
            entities['city_name'] = match.group(1).strip()
        
        # Extract due date
        date_patterns = [
            r'(?:due|by|before)\s+(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            r'(?:due|by|before)\s+(today|tomorrow|next week)',
            r'(?:due|by|before)\s+(\d+)\s+(?:days?|weeks?|months?)'
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, message, re.IGNORECASE)
            if match:
                date_str = match.group(1).strip()
                # Simple date parsing
                if date_str.lower() == 'today':
                    entities['due_date'] = datetime.now().isoformat()
                elif date_str.lower() == 'tomorrow':
                    entities['due_date'] = (datetime.now() + timedelta(days=1)).isoformat()
                elif date_str.lower() == 'next week':
                    entities['due_date'] = (datetime.now() + timedelta(days=7)).isoformat()
                else:
                    entities['due_date'] = date_str
                break
        
        return entities
    
    def _extract_jobcard_query_entities(self, message: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Extract job card ID or number for get/update/delete"""
        import re
        
        entities = {}
        
        # Extract job card ID
        id_pattern = r'(?:job card|jobcard)\s*(?:id|#)?\s*(\d+)'
        match = re.search(id_pattern, message, re.IGNORECASE)
        if match:
            entities['jobcard_id'] = int(match.group(1))
        
        # Extract job card number (JC-XXXX format)
        number_pattern = r'(JC-\d{4,})'
        match = re.search(number_pattern, message, re.IGNORECASE)
        if match:
            entities['jobcard_number'] = match.group(1).upper()
        
        # Extract status filter for listing
        status_patterns = {
            'PENDING': r'(?:pending|new)',
            'IN_PROGRESS': r'(?:progress|ongoing|working)',
            'COMPLETED': r'(?:completed|done|finished)',
            'CANCELLED': r'(?:cancelled|canceled)'
        }
        
        for status, pattern in status_patterns.items():
            if re.search(pattern, message, re.IGNORECASE):
                entities['status'] = status
                break
        
        # Extract employee name for filtering
        employee_pattern = r'(?:for|assigned to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)'
        match = re.search(employee_pattern, message, re.IGNORECASE)
        if match:
            entities['employee_name'] = match.group(1).strip()
        
        # Extract customer name for filtering
        customer_pattern = r'(?:customer|client)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)'
        match = re.search(customer_pattern, message, re.IGNORECASE)
        if match:
            entities['customer_name'] = match.group(1).strip()
        
        return entities
    
    def _generate_help_response(self, user_context: Dict[str, Any]) -> str:
        """Generate help response"""
        permissions = user_context.get('permissions', {})
        
        response = "Available commands:\n\n"
        response += "Tasks: 'assign task to John', 'show my tasks'\n"
        response += "Attendance: 'show attendance', 'attendance report'\n"
        response += "Employees: 'show employee John', 'list employees'\n"
        response += "Job Cards: 'create job card', 'show job cards'\n"
        response += "Field Reports: 'process field report'\n\n"
        
        # Add admin-specific commands
        user_type = user_context.get('user_type', '')
        is_superuser = user_context.get('is_superuser', False)
        if user_type == '1' or is_superuser:
            response += "Admin: 'delete job card 5', 'update job card 3', 'all job cards'"
        
        return response
    
    def _generate_greeting_response(self, user_context: Dict[str, Any]) -> str:
        """Generate greeting response"""
        # Get the actual name from database
        first_name = user_context.get('first_name', '')
        last_name = user_context.get('last_name', '')
        
        if first_name and last_name:
            name = f"{first_name} {last_name}"
        elif first_name:
            name = first_name
        else:
            name = "User"
            
        return f"Hello {name}. How can I help?"
    
    def _generate_task_response(self, entities: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Generate response for task creation"""
        employee_name = entities.get('employee_name', 'the employee')
        description = entities.get('description', 'the task')
        return f"Creating task for {employee_name}."
    
    def _generate_task_list_response(self, entities: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Generate response for task listing"""
        return "Fetching tasks..."
    
    def _generate_attendance_response(self, entities: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Generate response for attendance query"""
        if entities.get('self_query'):
            return "Fetching your attendance..."
        else:
            employee_name = entities.get('employee_name', 'the employee')
            return f"Fetching attendance for {employee_name}..."
    
    def _generate_employee_info_response(self, entities: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Generate response for employee info"""
        employee_name = entities.get('employee_name', 'the employee')
        return f"Looking up {employee_name}..."
    
    def _generate_employee_list_response(self, user_context: Dict[str, Any]) -> str:
        """Generate response for employee listing"""
        return "Fetching employee list..."
    
    def _generate_team_info_response(self, entities: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Generate response for team info"""
        team_name = entities.get('team_name', 'the team')
        return f"Fetching {team_name} info..."
    
    def _generate_jobcard_response(self, entities: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Generate response for job card creation"""
        employee_name = entities.get('employee_name', 'employee')
        return f"Creating job card for {employee_name}."
    
    def _generate_jobcard_query_response(self, entities: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Generate response for job card queries"""
        jobcard_id = entities.get('jobcard_id')
        jobcard_number = entities.get('jobcard_number')
        if jobcard_id:
            return f"Fetching job card {jobcard_id}..."
        elif jobcard_number:
            return f"Fetching job card {jobcard_number}..."
        else:
            return "Fetching job card..."
    
    def _generate_jobcard_list_response(self, entities: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Generate response for job card listing"""
        return "Fetching job cards..."
    
    def _generate_gemini_response(self, message: str, user_context: Dict[str, Any]) -> str:
        """Generate response using Gemini API for general questions"""
        try:
            # Create a context-aware prompt with conversation history
            context_info = f"You are an AI assistant for Axpect SMS staff management system. "
            context_info += f"User: {user_context.get('name', 'Unknown')} ({user_context.get('user_type_display', 'Unknown')}). "
            context_info += f"Give SHORT, DIRECT answers. No explanations, no thinking out loud. "
            context_info += f"Maximum 2 sentences. Be specific and actionable."
            
            # Add conversation history if available
            conversation_history = user_context.get('conversation_history', [])
            if conversation_history:
                context_info += "\n\nRecent conversation:"
                for msg in conversation_history[-3:]:  # Last 3 messages for context
                    if msg['type'] == 'user':
                        context_info += f"\nUser: {msg['content']}"
                    elif msg['type'] == 'bot':
                        context_info += f"\nAssistant: {msg['content']}"

            # Use the get_completion method to get Gemini response
            response = self.get_completion(
                prompt=message,
                system_message=context_info,
                max_tokens=150,
                temperature=0.3
            )

            return response if response else "Unable to process request."

        except Exception as e:
            logger.error(f"Error generating Gemini response: {str(e)}")
            return "Error processing request."