"""
AI Actions Module
Handles execution of AI-requested actions
"""

import logging
from typing import Dict, Any, Optional
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import datetime, timedelta

from main_app.models import (
    Employee, JobCard, Customer, City, Item, 
    EmployeeTask, Attendance, CommunicationLog
)

logger = logging.getLogger(__name__)
User = get_user_model()


def execute_action(action_type: str, parameters: Dict[str, Any], user: User) -> Dict[str, Any]:
    """
    Execute an action requested by the AI
    
    Args:
        action_type: Type of action to execute
        parameters: Action parameters
        user: User requesting the action
        
    Returns:
        Dict containing action result
    """
    try:
        if action_type == 'create_task':
            return create_task(parameters, user)
        elif action_type == 'assign_jobcard':
            return assign_jobcard(parameters, user)
        elif action_type == 'get_attendance':
            return get_attendance(parameters, user)
        elif action_type == 'get_employee_info':
            return get_employee_info(parameters, user)
        elif action_type == 'create_customer':
            return create_customer(parameters, user)
        elif action_type == 'log_communication':
            return log_communication(parameters, user)
        else:
            return {
                'success': False,
                'error': f'Unknown action type: {action_type}'
            }
    except Exception as e:
        logger.error(f"Error executing action {action_type}: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }


def create_task(parameters: Dict[str, Any], user: User) -> Dict[str, Any]:
    """Create a new task for an employee"""
    try:
        # Get employee
        employee_id = parameters.get('employee_id')
        if not employee_id:
            return {'success': False, 'error': 'Employee ID required'}
        
        try:
            employee = Employee.objects.get(id=employee_id)
        except Employee.DoesNotExist:
            return {'success': False, 'error': 'Employee not found'}
        
        # Create task
        task = EmployeeTask.objects.create(
            employee=employee,
            title=parameters.get('title', 'New Task'),
            description=parameters.get('description', ''),
            priority=parameters.get('priority', 'medium'),
            assigned_by=user,
            due_date=parameters.get('due_date')
        )
        
        return {
            'success': True,
            'task_id': task.id,
            'message': f'Task "{task.title}" created for {employee.admin.get_full_name()}'
        }
        
    except Exception as e:
        return {'success': False, 'error': str(e)}


def assign_jobcard(parameters: Dict[str, Any], user: User) -> Dict[str, Any]:
    """Assign a job card to an employee"""
    try:
        # Get employee
        employee_id = parameters.get('employee_id')
        if not employee_id:
            return {'success': False, 'error': 'Employee ID required'}
        
        try:
            employee = Employee.objects.get(id=employee_id)
        except Employee.DoesNotExist:
            return {'success': False, 'error': 'Employee not found'}
        
        # Create job card
        jobcard = JobCard.objects.create(
            assigned_to=employee,
            assigned_by=user,
            description=parameters.get('description', ''),
            type=parameters.get('type', 'VISIT'),
            priority=parameters.get('priority', 'MEDIUM'),
            due_date=parameters.get('due_date'),
            customer_id=parameters.get('customer_id'),
            city_id=parameters.get('city_id')
        )
        
        return {
            'success': True,
            'jobcard_id': jobcard.id,
            'jobcard_number': jobcard.job_card_number,
            'message': f'Job card {jobcard.job_card_number} assigned to {employee.admin.get_full_name()}'
        }
        
    except Exception as e:
        return {'success': False, 'error': str(e)}


def get_attendance(parameters: Dict[str, Any], user: User) -> Dict[str, Any]:
    """Get attendance information"""
    try:
        employee_id = parameters.get('employee_id')
        if not employee_id:
            return {'success': False, 'error': 'Employee ID required'}
        
        try:
            employee = Employee.objects.get(id=employee_id)
        except Employee.DoesNotExist:
            return {'success': False, 'error': 'Employee not found'}
        
        # Get date range
        start_date = parameters.get('start_date', timezone.now().date() - timedelta(days=30))
        end_date = parameters.get('end_date', timezone.now().date())
        
        # Get attendance records
        attendance_records = Attendance.objects.filter(
            attendancereport__employee=employee,
            date__range=[start_date, end_date]
        ).order_by('-date')
        
        records = []
        for record in attendance_records:
            try:
                status = record.attendancereport_set.filter(employee=employee).first()
                records.append({
                    'date': record.date,
                    'status': 'Present' if status and status.status else 'Absent',
                    'notes': record.notes
                })
            except:
                records.append({
                    'date': record.date,
                    'status': 'Unknown',
                    'notes': record.notes
                })
        
        return {
            'success': True,
            'employee_name': employee.admin.get_full_name(),
            'period': f"{start_date} to {end_date}",
            'records': records,
            'total_days': len(records),
            'present_days': len([r for r in records if r['status'] == 'Present'])
        }
        
    except Exception as e:
        return {'success': False, 'error': str(e)}


def get_employee_info(parameters: Dict[str, Any], user: User) -> Dict[str, Any]:
    """Get employee information"""
    try:
        employee_id = parameters.get('employee_id')
        if not employee_id:
            return {'success': False, 'error': 'Employee ID required'}
        
        try:
            employee = Employee.objects.get(id=employee_id)
        except Employee.DoesNotExist:
            return {'success': False, 'error': 'Employee not found'}
        
        return {
            'success': True,
            'employee': {
                'id': employee.id,
                'name': employee.admin.get_full_name(),
                'email': employee.admin.email,
                'department': employee.department.name if employee.department else 'N/A',
                'division': employee.division.name if employee.division else 'N/A',
                'is_online': employee.admin.is_online,
                'last_seen': employee.admin.last_seen
            }
        }
        
    except Exception as e:
        return {'success': False, 'error': str(e)}


def create_customer(parameters: Dict[str, Any], user: User) -> Dict[str, Any]:
    """Create a new customer"""
    try:
        customer = Customer.objects.create(
            name=parameters.get('name', ''),
            code=parameters.get('code', ''),
            city_id=parameters.get('city_id'),
            address=parameters.get('address', ''),
            phone_primary=parameters.get('phone', ''),
            email=parameters.get('email', ''),
            owner_staff_id=parameters.get('owner_staff_id')
        )
        
        return {
            'success': True,
            'customer_id': customer.id,
            'customer_name': customer.name,
            'message': f'Customer "{customer.name}" created successfully'
        }
        
    except Exception as e:
        return {'success': False, 'error': str(e)}


def log_communication(parameters: Dict[str, Any], user: User) -> Dict[str, Any]:
    """Log communication with customer"""
    try:
        communication = CommunicationLog.objects.create(
            channel=parameters.get('channel', 'PHONE'),
            direction=parameters.get('direction', 'OUT'),
            customer_id=parameters.get('customer_id'),
            user=user,
            subject=parameters.get('subject', ''),
            body=parameters.get('body', ''),
            linkages=parameters.get('linkages', {})
        )
        
        return {
            'success': True,
            'communication_id': communication.id,
            'message': 'Communication logged successfully'
        }
        
    except Exception as e:
        return {'success': False, 'error': str(e)}


def parse_natural_language(message: str) -> Dict[str, Any]:
    """
    Parse natural language message to extract action and parameters
    
    This is a simplified parser - in production, you'd want more sophisticated NLP
    """
    message_lower = message.lower()
    
    # Task creation patterns
    if any(word in message_lower for word in ['assign', 'create', 'task']):
        return {
            'action_type': 'create_task',
            'parameters': {
                'title': extract_title(message),
                'description': message,
                'priority': extract_priority(message)
            }
        }
    
    # Job card patterns
    elif any(word in message_lower for word in ['job card', 'jobcard', 'visit', 'call']):
        return {
            'action_type': 'assign_jobcard',
            'parameters': {
                'description': message,
                'type': extract_job_type(message),
                'priority': extract_priority(message)
            }
        }
    
    # Attendance patterns
    elif any(word in message_lower for word in ['attendance', 'present', 'absent']):
        return {
            'action_type': 'get_attendance',
            'parameters': {
                'employee_id': extract_employee_id(message)
            }
        }
    
    # Employee info patterns
    elif any(word in message_lower for word in ['employee', 'staff', 'worker']):
        return {
            'action_type': 'get_employee_info',
            'parameters': {
                'employee_id': extract_employee_id(message)
            }
        }
    
    # Default to general response
    return {
        'action_type': 'general_response',
        'parameters': {}
    }


def extract_title(message: str) -> str:
    """Extract task title from message"""
    # Simple extraction - look for quoted text or first sentence
    if '"' in message:
        start = message.find('"') + 1
        end = message.find('"', start)
        if end > start:
            return message[start:end]
    
    # Take first 50 characters as title
    return message[:50].strip()


def extract_priority(message: str) -> str:
    """Extract priority from message"""
    message_lower = message.lower()
    if any(word in message_lower for word in ['urgent', 'asap', 'immediately']):
        return 'urgent'
    elif any(word in message_lower for word in ['high', 'important']):
        return 'high'
    elif any(word in message_lower for word in ['low', 'when possible']):
        return 'low'
    else:
        return 'medium'


def extract_job_type(message: str) -> str:
    """Extract job type from message"""
    message_lower = message.lower()
    if 'visit' in message_lower or 'meet' in message_lower:
        return 'VISIT'
    elif 'call' in message_lower or 'phone' in message_lower:
        return 'CALL'
    elif 'sample' in message_lower:
        return 'SAMPLE'
    elif 'collection' in message_lower or 'collect' in message_lower:
        return 'COLLECTION'
    else:
        return 'VISIT'


def extract_employee_id(message: str) -> Optional[int]:
    """Extract employee ID from message"""
    # This is a simplified extraction - in production, you'd want more sophisticated parsing
    import re
    
    # Look for patterns like "employee 123" or "staff 456"
    patterns = [
        r'employee\s+(\d+)',
        r'staff\s+(\d+)',
        r'worker\s+(\d+)',
        r'user\s+(\d+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, message_lower)
        if match:
            return int(match.group(1))
    
    return None