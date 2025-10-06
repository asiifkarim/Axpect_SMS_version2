"""
AI Chatbot Views
"""

import json
import logging
from django.http import JsonResponse
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.views import View
from django.utils import timezone

from .llm_handler import get_llm_handler
from .actions import execute_action

logger = logging.getLogger(__name__)


@login_required
def chatbot_interface(request):
    """Render the chatbot interface"""
    context = {
        'user_name': f"{request.user.first_name} {request.user.last_name}",
        'user_type': request.user.get_user_type_display(),
    }
    return render(request, 'ai/chatbot.html', context)


@csrf_exempt
@require_http_methods(["POST"])
@login_required
def chatbot_response(request):
    """
    Handle chatbot messages and return AI responses
    
    Expected POST data:
    {
        "message": "User's message text"
    }
    
    Returns:
    {
        "success": true/false,
        "response": "AI response text",
        "action_result": {...} // Optional action result
    }
    """
    try:
        # Parse request data
        data = json.loads(request.body)
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return JsonResponse({
                'success': False,
                'response': 'Please provide a message.',
                'error': 'Empty message'
            })
        
        # Prepare user context for the AI
        user_context = {
            'name': f"{request.user.first_name} {request.user.last_name}",
            'email': request.user.email,
            'user_type': request.user.user_type,
            'user_type_display': request.user.get_user_type_display(),
            'is_superuser': request.user.is_superuser,
            'permissions': {
                'can_manage_tasks': request.user.user_type in ['1', '2'] or request.user.is_superuser,
                'can_view_all_attendance': request.user.user_type in ['1', '2'] or request.user.is_superuser,
                'can_manage_employees': request.user.user_type == '1' or request.user.is_superuser,
            }
        }
        
        # Get LLM handler and process the message
        llm_handler = get_llm_handler()
        ai_response, action_data = llm_handler.process_chat(user_message, user_context)
        
        response_data = {
            'success': True,
            'response': ai_response,
            'timestamp': json.dumps(timezone.now(), default=str) if 'timezone' in globals() else None
        }
        
        # Execute action if detected
        if action_data and 'action' in action_data:
            action_name = action_data['action']
            parameters = action_data.get('parameters', {})
            
            logger.info(f"Executing action: {action_name} with parameters: {parameters}")
            
            # Execute the action
            action_result = execute_action(action_name, parameters, request.user)
            
            # Add action result to response
            response_data['action_result'] = action_result
            
            # If action was successful, append result to AI response
            if action_result.get('success'):
                if action_result.get('message'):
                    response_data['response'] += f"\n\n{action_result['message']}"
                
                # Add formatted data for specific actions
                if action_name == 'get_tasks' and action_result.get('tasks'):
                    tasks_text = "\n".join([
                        f"• **{task['title']}** (ID: {task['id']}) - {task['status']} - Priority: {task['priority']}"
                        for task in action_result['tasks'][:5]  # Show max 5 tasks
                    ])
                    response_data['response'] += f"\n\n{tasks_text}"
                
                elif action_name == 'get_attendance' and action_result.get('attendance'):
                    summary = action_result.get('summary', {})
                    if summary:
                        response_data['response'] += f"\n\n📊 **Summary**: {summary['present_days']}/{summary['total_days']} days present ({summary['attendance_percentage']}%)"
                
                elif action_name == 'get_employee_info' and action_result.get('employee_info'):
                    info = action_result['employee_info']
                    info_text = f"\n\n**Name**: {info['name']}\n**Email**: {info['email']}\n**Role**: {info['user_type']}\n**Department**: {info['department']}"
                    response_data['response'] += info_text
                
                elif action_name == 'list_employees' and action_result.get('employees'):
                    employees_text = "\n".join([
                        f"• {emp['name']} - {emp['department']}"
                        for emp in action_result['employees'][:10]  # Show max 10 employees
                    ])
                    response_data['response'] += f"\n\n{employees_text}"
            
            else:
                # Action failed, show error message
                response_data['response'] = action_result.get('message', 'Action failed.')
        
        return JsonResponse(response_data)
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'response': 'Invalid JSON data provided.',
            'error': 'JSON decode error'
        })
    
    except Exception as e:
        logger.error(f"Error in chatbot_response: {e}")
        return JsonResponse({
            'success': False,
            'response': 'I apologize, but I encountered an error while processing your request. Please try again.',
            'error': str(e)
        })


class ChatbotAPIView(View):
    """
    Alternative class-based view for chatbot API
    """
    
    @method_decorator(csrf_exempt)
    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)
    
    def post(self, request):
        """Handle POST requests to chatbot API"""
        return chatbot_response(request)
    
    def get(self, request):
        """Handle GET requests - return chatbot interface"""
        return chatbot_interface(request)
