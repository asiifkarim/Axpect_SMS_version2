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
from datetime import timedelta

from .llm_handler import LLMHandler
from .actions import execute_action
from .models import ChatSession, ChatMessage, ChatContext

logger = logging.getLogger(__name__)


def get_or_create_chat_session(user):
    """Get or create an active chat session for the user"""
    # Clean up old sessions (older than 24 hours)
    cutoff_time = timezone.now() - timedelta(hours=24)
    ChatSession.objects.filter(
        user=user,
        is_active=True,
        updated_at__lt=cutoff_time
    ).update(is_active=False)
    
    # Get or create active session
    session, created = ChatSession.objects.get_or_create(
        user=user,
        is_active=True,
        defaults={'created_at': timezone.now()}
    )
    
    # Create context if it doesn't exist
    if created:
        ChatContext.objects.create(session=session)
    
    return session


def get_conversation_history(session, limit=10):
    """Get recent conversation history for a session"""
    messages = ChatMessage.objects.filter(
        session=session
    ).order_by('-timestamp')[:limit]
    
    # Convert to list and reverse to get chronological order
    history = []
    for msg in reversed(messages):
        history.append({
            'type': msg.message_type,
            'content': msg.content,
            'timestamp': msg.timestamp,
            'intent': msg.intent,
            'entities': msg.entities,
            'action_executed': msg.action_executed,
        })
    
    return history


def store_message(session, message_type, content, intent=None, entities=None, action_executed=None, action_result=None):
    """Store a message in the chat session"""
    ChatMessage.objects.create(
        session=session,
        message_type=message_type,
        content=content,
        intent=intent,
        entities=entities or {},
        action_executed=action_executed,
        action_result=action_result or {}
    )
    
    # Update session timestamp
    session.updated_at = timezone.now()
    session.save(update_fields=['updated_at'])


@login_required
def chatbot_interface(request):
    """Render the chatbot interface"""
    # Get or create active chat session
    session = get_or_create_chat_session(request.user)
    
    context = {
        'user_name': f"{request.user.first_name} {request.user.last_name}",
        'user_type': request.user.get_user_type_display(),
        'session_id': str(session.id),
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
        "message": "User's message text",
        "session_id": "optional session ID"
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
        session_id = data.get('session_id')
        
        if not user_message:
            return JsonResponse({
                'success': False,
                'response': 'Please provide a message.',
                'error': 'Empty message'
            })
        
        # Get or create chat session
        if session_id:
            try:
                session = ChatSession.objects.get(id=session_id, user=request.user, is_active=True)
            except ChatSession.DoesNotExist:
                session = get_or_create_chat_session(request.user)
        else:
            session = get_or_create_chat_session(request.user)
        
        # Get conversation history
        conversation_history = get_conversation_history(session)
        
        # Store user message
        store_message(session, 'user', user_message)
        
        # Prepare user context for the AI
        user_context = {
            'name': f"{request.user.first_name} {request.user.last_name}",
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'email': request.user.email,
            'user_type': request.user.user_type,
            'user_type_display': request.user.get_user_type_display(),
            'is_superuser': request.user.is_superuser,
            'permissions': {
                'can_manage_tasks': request.user.user_type in ['1', '2'] or request.user.is_superuser,
                'can_view_all_attendance': request.user.user_type in ['1', '2'] or request.user.is_superuser,
                'can_manage_employees': request.user.user_type == '1' or request.user.is_superuser,
            },
            'conversation_history': conversation_history,
            'session_id': str(session.id)
        }
        
        # Get LLM handler and process the message
        llm_handler = LLMHandler()
        ai_response, action_data = llm_handler.process_chat(user_message, user_context)
        
        print(f"DEBUG: AI response: {ai_response}")
        print(f"DEBUG: Action data: {action_data}")
        
        response_data = {
            'success': True,
            'response': ai_response,
            'session_id': str(session.id),
            'timestamp': json.dumps(timezone.now(), default=str) if 'timezone' in globals() else None
        }
        
        # Execute action if detected
        action_result = None
        if action_data and 'action' in action_data:
            action_name = action_data['action']
            parameters = action_data.get('parameters', {})
            
            print(f"DEBUG: Executing action: {action_name} with parameters: {parameters}")
            logger.info(f"Executing action: {action_name} with parameters: {parameters}")
            
            try:
                # Execute the action
                action_result = execute_action(action_name, parameters, request.user)
                print(f"DEBUG: Action result: {action_result}")
                logger.info(f"Action result: {action_result}")
            except Exception as e:
                print(f"DEBUG: Action execution failed: {str(e)}")
                logger.error(f"Action execution failed: {str(e)}")
                action_result = {'success': False, 'error': str(e)}
        else:
            print("DEBUG: No action data to execute")
            logger.info("No action data to execute")
        
        # Add action result to response
        if action_result:
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
                
                # Job card specific handling
                elif action_name == 'create_jobcard' and action_result.get('success'):
                    response_data['response'] = action_result.get('message', 'Job card created successfully')
                
                elif action_name == 'list_jobcards' and action_result.get('jobcards'):
                    jobcards_text = "\n".join([
                        f"• **{jc['jobcard_number']}** - {jc['description']} - {jc['status']} - Assigned to: {jc['assigned_to']}"
                        for jc in action_result['jobcards'][:10]  # Show max 10 job cards
                    ])
                    response_data['response'] = f"{action_result.get('message', '')}\n\n{jobcards_text}"
                
                elif action_name == 'get_jobcard' and action_result.get('jobcard'):
                    jc = action_result['jobcard']
                    jc_text = f"**Job Card {jc['jobcard_number']}**\n"
                    jc_text += f"Description: {jc['description']}\n"
                    jc_text += f"Status: {jc['status']}\n"
                    jc_text += f"Priority: {jc['priority']}\n"
                    jc_text += f"Assigned to: {jc['assigned_to']}\n"
                    jc_text += f"Created: {jc['created_date']}"
                    response_data['response'] = jc_text
                
                elif action_name == 'update_jobcard' and action_result.get('success'):
                    response_data['response'] = action_result.get('message', 'Job card updated successfully')
                
                elif action_name == 'delete_jobcard' and action_result.get('success'):
                    response_data['response'] = action_result.get('message', 'Job card deleted successfully')
            
            else:
                # Action failed, show error message
                response_data['response'] = action_result.get('message', 'Action failed.')
        
        # Store bot response
        store_message(
            session, 
            'bot', 
            response_data['response'],
            intent=action_data.get('intent') if action_data else None,
            entities=action_data.get('entities') if action_data else None,
            action_executed=action_data.get('action') if action_data else None,
            action_result=action_result
        )
        
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
