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
    EmployeeTask, Attendance, CommunicationLog, Department, Division,
    AttendanceReport
)
from django.db import models

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
        elif action_type == 'get_tasks':
            return get_tasks(parameters, user)
        elif action_type == 'assign_jobcard':
            return assign_jobcard(parameters, user)
        elif action_type == 'get_attendance':
            return get_attendance(parameters, user)
        elif action_type == 'get_employee_info':
            return get_employee_info(parameters, user)
        elif action_type == 'list_employees':
            return list_employees(parameters, user)
        elif action_type == 'get_team_info':
            return get_team_info(parameters, user)
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


def find_employee_by_name(name: str) -> Optional[Employee]:
    """
    Find employee by name (fuzzy matching)
    
    Args:
        name: Employee name to search for
        
    Returns:
        Employee object or None
    """
    if not name:
        return None
    
    # Try exact match first
    name_parts = name.strip().split()
    if len(name_parts) == 1:
        # Single name - could be first or last name
        employees = Employee.objects.filter(
            models.Q(admin__first_name__iexact=name) | 
            models.Q(admin__last_name__iexact=name)
        )
    else:
        # Multiple parts - try first and last name
        first_name = name_parts[0]
        last_name = ' '.join(name_parts[1:])
        employees = Employee.objects.filter(
            admin__first_name__iexact=first_name,
            admin__last_name__iexact=last_name
        )
    
    if employees.exists():
        return employees.first()
    
    # Try partial matching
    employees = Employee.objects.filter(
        models.Q(admin__first_name__icontains=name) |
        models.Q(admin__last_name__icontains=name)
    )
    
    return employees.first() if employees.exists() else None


def create_task(parameters: Dict[str, Any], user: User) -> Dict[str, Any]:
    """Create a new task for an employee"""
    from main_app.notification_helpers import notify_task_assignment
    
    try:
        # Get employee by ID or name
        employee_id = parameters.get('employee_id')
        employee_name = parameters.get('employee_name')
        
        employee = None
        if employee_id:
            try:
                employee = Employee.objects.get(id=employee_id)
            except Employee.DoesNotExist:
                return {'success': False, 'message': 'Employee not found by ID'}
        elif employee_name:
            employee = find_employee_by_name(employee_name)
            if not employee:
                return {
                    'success': False, 
                    'message': f'Could not find employee with name "{employee_name}". Please check the spelling or use their full name.'
                }
        else:
            return {'success': False, 'message': 'Please specify an employee name or ID'}
        
        # Extract title from description if not provided
        description = parameters.get('description', '').strip()
        title = parameters.get('title', description[:50] if description else 'New Task')
        
        # Create task
        from datetime import datetime
        due_date = None
        if parameters.get('due_date'):
            try:
                due_date = datetime.fromisoformat(parameters['due_date'])
            except:
                due_date = None
        
        task = EmployeeTask.objects.create(
            employee=employee,
            title=title,
            description=description,
            priority=parameters.get('priority', 'medium'),
            assigned_by=user,
            due_date=due_date
        )
        
        # Notify admin about the assignment (only if assigned by manager/employee)
        if user.user_type in ['2', '3']:
            notify_task_assignment(task)
        
        return {
            'success': True,
            'task_id': task.id,
            'message': f'✅ Task "{task.title}" successfully assigned to {employee.admin.get_full_name()}!'
        }
        
    except Exception as e:
        logger.error(f"Error creating task: {str(e)}")
        return {'success': False, 'message': f'Error creating task: {str(e)}'}


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


def get_tasks(parameters: Dict[str, Any], user: User) -> Dict[str, Any]:
    """Get tasks for a user"""
    try:
        # Check if user is querying their own tasks
        if parameters.get('self_query') or user.user_type == '3':
            try:
                employee = Employee.objects.get(admin=user)
                tasks = EmployeeTask.objects.filter(employee=employee).exclude(
                    status='completed'
                ).order_by('-assigned_date')[:10]
                
                task_list = []
                for task in tasks:
                    task_list.append({
                        'id': task.id,
                        'title': task.title,
                        'description': task.description[:100] if task.description else '',
                        'status': task.status,
                        'priority': task.priority,
                        'due_date': task.due_date.isoformat() if task.due_date else None,
                        'assigned_by': task.assigned_by.get_full_name() if task.assigned_by else 'System'
                    })
                
                return {
                    'success': True,
                    'tasks': task_list,
                    'total': len(task_list),
                    'message': f'📋 You have {len(task_list)} active task(s).'
                }
            except Employee.DoesNotExist:
                return {'success': False, 'message': 'Employee profile not found'}
        else:
            # Admin/Manager querying tasks - show all or filtered
            if user.user_type in ['1', '2']:
                tasks = EmployeeTask.objects.all().exclude(status='completed').order_by('-assigned_date')[:20]
                task_list = []
                for task in tasks:
                    task_list.append({
                        'id': task.id,
                        'title': task.title,
                        'employee': task.employee.admin.get_full_name(),
                        'status': task.status,
                        'priority': task.priority,
                        'due_date': task.due_date.isoformat() if task.due_date else None
                    })
                
                return {
                    'success': True,
                    'tasks': task_list,
                    'total': len(task_list),
                    'message': f'📋 Found {len(task_list)} active tasks.'
                }
            else:
                return {'success': False, 'message': 'Insufficient permissions'}
                
    except Exception as e:
        logger.error(f"Error getting tasks: {str(e)}")
        return {'success': False, 'message': f'Error retrieving tasks: {str(e)}'}


def get_attendance(parameters: Dict[str, Any], user: User) -> Dict[str, Any]:
    """Get attendance information"""
    try:
        # Determine which employee's attendance to fetch
        employee = None
        employee_name = parameters.get('employee_name')
        
        if parameters.get('self_query') or (not employee_name and user.user_type == '3'):
            # User querying their own attendance
            try:
                employee = Employee.objects.get(admin=user)
            except Employee.DoesNotExist:
                return {'success': False, 'message': 'Employee profile not found'}
        elif employee_name:
            # Querying someone else's attendance
            if user.user_type not in ['1', '2']:
                return {'success': False, 'message': 'You can only view your own attendance'}
            employee = find_employee_by_name(employee_name)
            if not employee:
                return {'success': False, 'message': f'Could not find employee "{employee_name}"'}
        else:
            # Default to current user if they're an employee
            if user.user_type == '3':
                try:
                    employee = Employee.objects.get(admin=user)
                except Employee.DoesNotExist:
                    return {'success': False, 'message': 'Employee profile not found'}
            else:
                return {'success': False, 'message': 'Please specify an employee name'}
        
        # Parse date range
        from datetime import datetime
        start_date = parameters.get('start_date')
        end_date = parameters.get('end_date')
        
        if start_date and isinstance(start_date, str):
            start_date = datetime.fromisoformat(start_date).date()
        if end_date and isinstance(end_date, str):
            end_date = datetime.fromisoformat(end_date).date()
            
        if not start_date:
            start_date = timezone.now().date() - timedelta(days=30)
        if not end_date:
            end_date = timezone.now().date()
        
        # Get attendance records
        attendance_records = AttendanceReport.objects.filter(
            employee=employee,
            attendance__date__range=[start_date, end_date]
        ).select_related('attendance').order_by('-attendance__date')
        
        records = []
        present_count = 0
        for record in attendance_records:
            is_present = record.status
            if is_present:
                present_count += 1
            records.append({
                'date': str(record.attendance.date),
                'status': 'Present' if is_present else 'Absent',
                'notes': record.attendance.notes or ''
            })
        
        total_days = len(records)
        attendance_percentage = round((present_count / total_days * 100), 1) if total_days > 0 else 0
        
        return {
            'success': True,
            'employee_name': employee.admin.get_full_name(),
            'period': f"{start_date} to {end_date}",
            'attendance': records,
            'summary': {
                'total_days': total_days,
                'present_days': present_count,
                'absent_days': total_days - present_count,
                'attendance_percentage': f"{attendance_percentage}%"
            },
            'message': f'📅 Attendance for {employee.admin.get_full_name()}: {present_count}/{total_days} days present ({attendance_percentage}%)'
        }
        
    except Exception as e:
        logger.error(f"Error getting attendance: {str(e)}")
        return {'success': False, 'message': f'Error retrieving attendance: {str(e)}'}


def get_employee_info(parameters: Dict[str, Any], user: User) -> Dict[str, Any]:
    """Get employee information"""
    try:
        employee_id = parameters.get('employee_id')
        employee_name = parameters.get('employee_name')
        
        employee = None
        if employee_id:
            try:
                employee = Employee.objects.get(id=employee_id)
            except Employee.DoesNotExist:
                return {'success': False, 'message': 'Employee not found'}
        elif employee_name:
            employee = find_employee_by_name(employee_name)
            if not employee:
                return {'success': False, 'message': f'Could not find employee "{employee_name}"'}
        else:
            return {'success': False, 'message': 'Please specify an employee name or ID'}
        
        return {
            'success': True,
            'employee_info': {
                'id': employee.id,
                'name': employee.admin.get_full_name(),
                'email': employee.admin.email,
                'user_type': 'Employee',
                'department': employee.department.name if employee.department else 'Not assigned',
                'division': employee.division.name if employee.division else 'Not assigned',
                'is_online': employee.admin.is_online,
                'last_seen': employee.admin.last_seen.isoformat() if employee.admin.last_seen else 'Never'
            },
            'message': f'👤 Employee information for {employee.admin.get_full_name()}'
        }
        
    except Exception as e:
        logger.error(f"Error getting employee info: {str(e)}")
        return {'success': False, 'message': f'Error retrieving employee information: {str(e)}'}


def list_employees(parameters: Dict[str, Any], user: User) -> Dict[str, Any]:
    """List all employees"""
    try:
        # Filter employees based on user permissions
        if user.user_type == '1':  # Admin - can see all
            employees = Employee.objects.all().select_related('admin', 'department', 'division')
        elif user.user_type == '2':  # Manager - see their division
            try:
                manager = user.manager
                employees = Employee.objects.filter(division=manager.division).select_related('admin', 'department', 'division')
            except:
                employees = Employee.objects.none()
        else:  # Employee - see same department
            try:
                employee = Employee.objects.get(admin=user)
                employees = Employee.objects.filter(department=employee.department).select_related('admin', 'department', 'division')
            except:
                employees = Employee.objects.none()
        
        employee_list = []
        for emp in employees[:50]:  # Limit to 50 employees
            employee_list.append({
                'id': emp.id,
                'name': emp.admin.get_full_name(),
                'email': emp.admin.email,
                'department': emp.department.name if emp.department else 'N/A',
                'division': emp.division.name if emp.division else 'N/A',
                'is_online': emp.admin.is_online
            })
        
        return {
            'success': True,
            'employees': employee_list,
            'total': len(employee_list),
            'message': f'👥 Found {len(employee_list)} employee(s).'
        }
        
    except Exception as e:
        logger.error(f"Error listing employees: {str(e)}")
        return {'success': False, 'message': f'Error retrieving employees: {str(e)}'}


def get_team_info(parameters: Dict[str, Any], user: User) -> Dict[str, Any]:
    """Get team/department information"""
    try:
        team_name = parameters.get('team_name', '')
        
        # Try to find department or division
        department = None
        division = None
        
        if team_name:
            # Try department first
            department = Department.objects.filter(
                models.Q(name__iexact=team_name) | models.Q(name__icontains=team_name)
            ).first()
            
            if not department:
                # Try division
                division = Division.objects.filter(
                    models.Q(name__iexact=team_name) | models.Q(name__icontains=team_name)
                ).first()
        
        if department:
            # Get department info
            employees = Employee.objects.filter(department=department).select_related('admin')
            
            member_list = []
            for emp in employees[:20]:
                member_list.append({
                    'name': emp.admin.get_full_name(),
                    'email': emp.admin.email,
                    'is_online': emp.admin.is_online
                })
            
            return {
                'success': True,
                'team_info': {
                    'name': department.name,
                    'type': 'Department',
                    'division': department.division.name if department.division else 'N/A',
                    'member_count': len(member_list),
                    'members': member_list
                },
                'message': f'🏢 Department: {department.name} ({len(member_list)} members)'
            }
        elif division:
            # Get division info
            employees = Employee.objects.filter(division=division).select_related('admin', 'department')
            departments = Department.objects.filter(division=division)
            
            member_list = []
            for emp in employees[:20]:
                member_list.append({
                    'name': emp.admin.get_full_name(),
                    'department': emp.department.name if emp.department else 'N/A',
                    'email': emp.admin.email
                })
            
            return {
                'success': True,
                'team_info': {
                    'name': division.name,
                    'type': 'Division',
                    'department_count': departments.count(),
                    'member_count': len(member_list),
                    'members': member_list
                },
                'message': f'🏢 Division: {division.name} ({len(member_list)} members, {departments.count()} departments)'
            }
        else:
            return {
                'success': False,
                'message': f'Could not find team/department "{team_name}". Please check the spelling.'
            }
        
    except Exception as e:
        logger.error(f"Error getting team info: {str(e)}")
        return {'success': False, 'message': f'Error retrieving team information: {str(e)}'}


def create_customer(parameters: Dict[str, Any], user: User) -> Dict[str, Any]:
    """Create a new customer"""
    from main_app.notification_helpers import notify_customer_addition
    
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
        
        # Notify admin about the customer addition (only if created by manager/employee)
        if user.user_type in ['2', '3']:
            notify_customer_addition(customer, user)
        
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