"""
AI Actions Handler
Handles database operations for the AI chatbot
"""

import logging
from datetime import datetime, date, timedelta
from typing import Dict, Any, List, Optional
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone
from main_app.models import (
    CustomUser, Employee, EmployeeTask, EmployeeGPSAttendance, 
    Department, Division, Manager, Admin, JobCard
)

logger = logging.getLogger(__name__)

class ActionHandler:
    """Handles AI-triggered database actions"""
    
    def __init__(self, user: CustomUser):
        self.user = user
        self.user_employee = self._get_user_employee()
        
    def _get_user_employee(self) -> Optional[Employee]:
        """Get the Employee object for the current user"""
        try:
            if hasattr(self.user, 'employee'):
                return self.user.employee
            # If no employee profile, try to find by email or create a virtual one for admins
            if self.user.is_superuser or self.user.user_type == '1':
                # For admin users, return None but handle gracefully in other methods
                return None
            return None
        except Exception:
            return None
    
    def _can_manage_tasks(self) -> bool:
        """Check if user can create/manage tasks for others"""
        return self.user.user_type in ['1', '2'] or self.user.is_superuser  # CEO or Manager
    
    def _can_view_all_attendance(self) -> bool:
        """Check if user can view attendance for all employees"""
        return self.user.user_type in ['1', '2'] or self.user.is_superuser  # CEO or Manager
    
    def _find_employee_by_name(self, name: str) -> Optional[Employee]:
        """Find employee by name (fuzzy matching)"""
        if name.lower() in ['me', 'myself', 'current_user']:
            return self.user_employee
            
        try:
            # Try exact match first
            employees = Employee.objects.filter(
                Q(admin__first_name__icontains=name) |
                Q(admin__last_name__icontains=name) |
                Q(admin__email__icontains=name)
            ).select_related('admin')
            
            if employees.exists():
                return employees.first()
            return None
        except Exception as e:
            logger.error(f"Error finding employee: {e}")
            return None

    def create_task(self, employee_name: str, description: str, priority: str = 'medium', 
                   due_date: Optional[str] = None) -> Dict[str, Any]:
        """
        Create a new task for an employee
        
        Args:
            employee_name: Name of the employee to assign task to
            description: Task description
            priority: Task priority (low, medium, high, urgent)
            due_date: Optional due date (YYYY-MM-DD format)
            
        Returns:
            Dictionary with success status and message
        """
        try:
            # Check permissions
            if not self._can_manage_tasks():
                return {
                    'success': False,
                    'message': "❌ You don't have permission to create tasks for other employees."
                }
            
            # Find the employee
            employee = self._find_employee_by_name(employee_name)
            if not employee:
                return {
                    'success': False,
                    'message': f"❌ Employee '{employee_name}' not found. Please check the name and try again."
                }
            
            # Parse due date if provided
            parsed_due_date = None
            if due_date:
                try:
                    parsed_due_date = datetime.strptime(due_date, '%Y-%m-%d').date()
                except ValueError:
                    return {
                        'success': False,
                        'message': "❌ Invalid date format. Please use YYYY-MM-DD format."
                    }
            
            # Create the task
            task = EmployeeTask.objects.create(
                employee=employee,
                title=description[:200],  # Limit title length
                description=description,
                priority=priority.lower(),
                assigned_by=self.user,
                due_date=parsed_due_date
            )
            
            employee_name = f"{employee.admin.first_name} {employee.admin.last_name}"
            return {
                'success': True,
                'message': f"✅ Task assigned to {employee_name} successfully! Task ID: {task.id}",
                'task_id': task.id
            }
            
        except Exception as e:
            logger.error(f"Error creating task: {e}")
            return {
                'success': False,
                'message': "❌ An error occurred while creating the task. Please try again."
            }

    def get_tasks(self, employee_name: Optional[str] = None, status: Optional[str] = None) -> Dict[str, Any]:
        """
        Get tasks for an employee
        
        Args:
            employee_name: Name of employee (None for current user)
            status: Filter by status (assigned, in_progress, completed, cancelled)
            
        Returns:
            Dictionary with tasks information
        """
        try:
            # Determine which employee's tasks to get
            if employee_name and employee_name.lower() not in ['me', 'myself', 'current_user']:
                if not self._can_manage_tasks():
                    return {
                        'success': False,
                        'message': "❌ You can only view your own tasks."
                    }
                employee = self._find_employee_by_name(employee_name)
                if not employee:
                    return {
                        'success': False,
                        'message': f"❌ Employee '{employee_name}' not found."
                    }
            else:
                employee = self.user_employee
                if not employee:
                    # Handle admin users without employee profiles - show all tasks
                    if self.user.is_superuser or self.user.user_type == '1':
                        # For admins, show all job cards in the system
                        all_job_cards = JobCard.objects.all()
                        if status:
                            # Map common status terms to JobCard status choices
                            status_mapping = {
                                'assigned': 'PENDING',
                                'pending': 'PENDING', 
                                'in_progress': 'IN_PROGRESS',
                                'completed': 'COMPLETED',
                                'cancelled': 'CANCELLED'
                            }
                            mapped_status = status_mapping.get(status.lower(), status.upper())
                            all_job_cards = all_job_cards.filter(status=mapped_status)
                        
                        job_cards = all_job_cards.order_by('-created_date')[:20]  # Show more job cards for admins
                        
                        if not job_cards.exists():
                            return {
                                'success': True,
                                'message': "📋 No job cards found in the system.\n\n💡 **Tip**: You can create job cards through:\n• Django Admin Panel (/admin/)\n• Job Card Management section in the sidebar\n• Create new job cards and assign them to employees",
                                'tasks': [],
                                'admin_note': "As an admin, you can create and assign job cards to employees."
                            }
                        
                        task_list = []
                        for job_card in job_cards:
                            assigned_employee = "Unassigned"
                            if job_card.assigned_to:
                                assigned_employee = f"{job_card.assigned_to.admin.first_name} {job_card.assigned_to.admin.last_name}"
                            
                            task_info = {
                                'id': job_card.id,
                                'job_card_number': job_card.job_card_number,
                                'title': job_card.get_type_display() or 'Job Card',
                                'description': job_card.description or 'No description provided',
                                'employee': assigned_employee,
                                'status': job_card.get_status_display(),
                                'priority': job_card.get_priority_display(),
                                'created_date': job_card.created_date.strftime('%Y-%m-%d'),
                                'due_date': job_card.due_date.strftime('%Y-%m-%d') if job_card.due_date else 'Not set',
                                'type': job_card.get_type_display() if job_card.type else 'General'
                            }
                            task_list.append(task_info)
                        
                        return {
                            'success': True,
                            'message': f"📋 Found {len(task_list)} job cards in the system:",
                            'tasks': task_list
                        }
                    return {
                        'success': False,
                        'message': "❌ No employee profile found for your account. Please contact your administrator."
                    }
            
            # Get job cards for specific employee
            job_cards_query = JobCard.objects.filter(assigned_to=employee)
            
            if status:
                # Map common status terms to JobCard status choices
                status_mapping = {
                    'assigned': 'PENDING',
                    'pending': 'PENDING', 
                    'in_progress': 'IN_PROGRESS',
                    'completed': 'COMPLETED',
                    'cancelled': 'CANCELLED'
                }
                mapped_status = status_mapping.get(status.lower(), status.upper())
                job_cards_query = job_cards_query.filter(status=mapped_status)
            
            job_cards = job_cards_query.order_by('-created_date')[:10]  # Limit to 10 recent job cards
            
            if not job_cards.exists():
                employee_name = f"{employee.admin.first_name} {employee.admin.last_name}"
                return {
                    'success': True,
                    'message': f"📋 No job cards found for {employee_name}.\n\n💡 **Tip**: Job cards are assigned by managers through the Job Card Management system.",
                    'tasks': []
                }
            
            # Format job cards
            task_list = []
            for job_card in job_cards:
                task_info = {
                    'id': job_card.id,
                    'job_card_number': job_card.job_card_number,
                    'title': job_card.get_type_display() or 'Job Card',
                    'description': job_card.description or 'No description provided',
                    'status': job_card.get_status_display(),
                    'priority': job_card.get_priority_display(),
                    'created_date': job_card.created_date.strftime('%Y-%m-%d'),
                    'due_date': job_card.due_date.strftime('%Y-%m-%d') if job_card.due_date else 'Not set',
                    'type': job_card.get_type_display() if job_card.type else 'General'
                }
                task_list.append(task_info)
            
            employee_name = f"{employee.admin.first_name} {employee.admin.last_name}"
            return {
                'success': True,
                'message': f"📋 Found {len(task_list)} job cards for {employee_name}:",
                'tasks': task_list
            }
            
        except Exception as e:
            logger.error(f"Error getting tasks: {e}")
            return {
                'success': False,
                'message': "❌ An error occurred while retrieving tasks."
            }

    def get_attendance(self, employee_name: Optional[str] = None, 
                      date_from: Optional[str] = None, date_to: Optional[str] = None) -> Dict[str, Any]:
        """
        Get attendance records for an employee
        
        Args:
            employee_name: Name of employee (None for current user)
            date_from: Start date (YYYY-MM-DD format)
            date_to: End date (YYYY-MM-DD format)
            
        Returns:
            Dictionary with attendance information
        """
        try:
            # Determine which employee's attendance to get
            if employee_name and employee_name.lower() not in ['me', 'myself', 'current_user']:
                if not self._can_view_all_attendance():
                    return {
                        'success': False,
                        'message': "❌ You can only view your own attendance records."
                    }
                employee = self._find_employee_by_name(employee_name)
                if not employee:
                    return {
                        'success': False,
                        'message': f"❌ Employee '{employee_name}' not found."
                    }
            else:
                employee = self.user_employee
                if not employee:
                    # Handle admin users without employee profiles - show all staff attendance
                    if self.user.is_superuser or self.user.user_type == '1':
                        # Parse date range first
                        if not date_from:
                            date_from = (timezone.now().date() - timedelta(days=7)).strftime('%Y-%m-%d')
                        if not date_to:
                            date_to = timezone.now().date().strftime('%Y-%m-%d')
                        
                        try:
                            start_date = datetime.strptime(date_from, '%Y-%m-%d').date()
                            end_date = datetime.strptime(date_to, '%Y-%m-%d').date()
                        except ValueError:
                            return {
                                'success': False,
                                'message': "❌ Invalid date format. Please use YYYY-MM-DD format."
                            }
                        
                        # Get all employees and their attendance
                        all_employees = Employee.objects.all()
                        if not all_employees.exists():
                            return {
                                'success': True,
                                'message': "📅 No employees found in the system.",
                                'attendance': []
                            }
                        
                        # Collect attendance for all employees
                        all_attendance = []
                        total_employees = 0
                        employees_with_records = 0
                        total_checkins = 0
                        total_checkouts = 0
                        
                        for emp in all_employees:
                            try:
                                total_employees += 1
                                emp_attendance = EmployeeGPSAttendance.objects.filter(
                                    employee=emp,
                                    date__range=[start_date, end_date]
                                ).order_by('-date')[:5]  # Last 5 records per employee
                                
                                if emp_attendance.exists():
                                    employees_with_records += 1
                                    emp_checkins = emp_attendance.exclude(checkin_time__isnull=True).count()
                                    emp_checkouts = emp_attendance.exclude(checkout_time__isnull=True).count()
                                    total_checkins += emp_checkins
                                    total_checkouts += emp_checkouts
                                    
                                    # Format employee attendance
                                    emp_records = []
                                    for record in emp_attendance:
                                        try:
                                            emp_records.append({
                                                'date': record.date.strftime('%Y-%m-%d'),
                                                'checkin_time': record.checkin_time.strftime('%H:%M') if record.checkin_time else None,
                                                'checkout_time': record.checkout_time.strftime('%H:%M') if record.checkout_time else None,
                                                'status': 'Present' if record.checkin_time else 'Absent'
                                            })
                                        except Exception as record_error:
                                            logger.error(f"Error formatting attendance record for {emp.admin.first_name}: {record_error}")
                                            continue
                                    
                                    all_attendance.append({
                                        'employee_name': f"{emp.admin.first_name} {emp.admin.last_name}",
                                        'employee_id': emp.id,
                                        'records': emp_records,
                                        'checkins': emp_checkins,
                                        'checkouts': emp_checkouts,
                                        'days_present': len([r for r in emp_records if r['status'] == 'Present'])
                                    })
                            except Exception as emp_error:
                                logger.error(f"Error processing attendance for employee {emp.id}: {emp_error}")
                                continue
                        
                        return {
                            'success': True,
                            'message': f"📅 All Staff Attendance ({date_from} to {date_to}):\n\n📊 **Summary**: {employees_with_records}/{total_employees} employees with records | {total_checkins} total check-ins, {total_checkouts} total check-outs",
                            'attendance': all_attendance,
                            'summary': {
                                'total_employees': total_employees,
                                'employees_with_records': employees_with_records,
                                'total_checkins': total_checkins,
                                'total_checkouts': total_checkouts,
                                'date_range': f"{date_from} to {date_to}"
                            }
                        }
                    return {
                        'success': False,
                        'message': "❌ No employee profile found for your account. Please contact your administrator."
                    }
            
            # Parse date range
            if not date_from:
                date_from = (timezone.now().date() - timedelta(days=7)).strftime('%Y-%m-%d')
            if not date_to:
                date_to = timezone.now().date().strftime('%Y-%m-%d')
            
            try:
                start_date = datetime.strptime(date_from, '%Y-%m-%d').date()
                end_date = datetime.strptime(date_to, '%Y-%m-%d').date()
            except ValueError:
                return {
                    'success': False,
                    'message': "❌ Invalid date format. Please use YYYY-MM-DD format."
                }
            
            # Get attendance records
            attendance_query = EmployeeGPSAttendance.objects.filter(
                employee=employee,
                date__range=[start_date, end_date]
            ).order_by('-date')
            
            attendance_records = attendance_query[:30]  # Limit to 30 records
            
            # Count check-ins and check-outs
            total_checkins = attendance_query.exclude(checkin_time__isnull=True).count()
            total_checkouts = attendance_query.exclude(checkout_time__isnull=True).count()
            
            if not attendance_records.exists():
                return {
                    'success': True,
                    'message': f"📅 No attendance records found for {employee.admin.first_name} {employee.admin.last_name} from {date_from} to {date_to}.\n\n💡 **Tip**: Attendance records are created when employees check in/out using the GPS system.",
                    'attendance': [],
                    'summary': {
                        'total_checkins': total_checkins,
                        'total_checkouts': total_checkouts,
                        'date_range': f"{date_from} to {date_to}"
                    }
                }
            
            # Format attendance data
            attendance_list = []
            total_days = 0
            present_days = 0
            
            for record in attendance_records:
                total_days += 1
                if record.checkin_time:
                    present_days += 1
                
                attendance_info = {
                    'date': record.date.strftime('%Y-%m-%d'),
                    'checkin_time': record.checkin_time.strftime('%H:%M') if record.checkin_time else None,
                    'checkout_time': record.checkout_time.strftime('%H:%M') if record.checkout_time else None,
                    'status': 'Present' if record.checkin_time else 'Absent',
                    'work_notes': record.work_notes or '',
                    'performance_rating': record.performance_rating
                }
                attendance_list.append(attendance_info)
            
            attendance_percentage = (present_days / total_days * 100) if total_days > 0 else 0
            
            employee_name = f"{employee.admin.first_name} {employee.admin.last_name}"
            return {
                'success': True,
                'message': f"📅 Attendance for {employee_name} ({date_from} to {date_to}):\n\n📊 **Summary**: {total_checkins} check-ins, {total_checkouts} check-outs | {present_days}/{total_days} days present ({round(attendance_percentage, 1)}%)",
                'attendance': attendance_list,
                'summary': {
                    'total_days': total_days,
                    'present_days': present_days,
                    'absent_days': total_days - present_days,
                    'attendance_percentage': round(attendance_percentage, 1),
                    'total_checkins': total_checkins,
                    'total_checkouts': total_checkouts,
                    'date_range': f"{date_from} to {date_to}"
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting attendance: {e}")
            return {
                'success': False,
                'message': "❌ An error occurred while retrieving attendance records."
            }

    def get_employee_info(self, employee_name: Optional[str] = None) -> Dict[str, Any]:
        """Get employee information"""
        try:
            if employee_name and employee_name.lower() not in ['me', 'myself', 'current_user']:
                employee = self._find_employee_by_name(employee_name)
            else:
                employee = self.user_employee
            
            if not employee:
                # Handle admin users without employee profiles
                if (not employee_name or employee_name.lower() in ['me', 'myself', 'current_user']) and (self.user.is_superuser or self.user.user_type == '1'):
                    # Show admin user info instead
                    info = {
                        'name': f"{self.user.first_name} {self.user.last_name}",
                        'email': self.user.email,
                        'user_type': self.user.get_user_type_display(),
                        'role': 'System Administrator',
                        'department': 'Administration',
                        'division': 'Management',
                        'joined_date': self.user.date_joined.strftime('%Y-%m-%d'),
                        'is_admin': True
                    }
                    
                    return {
                        'success': True,
                        'message': f"👤 Administrator Information:",
                        'employee_info': info
                    }
                return {
                    'success': False,
                    'message': f"❌ Employee not found."
                }
            
            info = {
                'name': f"{employee.admin.first_name} {employee.admin.last_name}",
                'email': employee.admin.email,
                'user_type': employee.admin.get_user_type_display(),
                'department': employee.department.name if employee.department else 'Not assigned',
                'division': employee.division.name if employee.division else 'Not assigned',
                'joined_date': employee.admin.date_joined.strftime('%Y-%m-%d')
            }
            
            return {
                'success': True,
                'message': f"👤 Employee Information:",
                'employee_info': info
            }
            
        except Exception as e:
            logger.error(f"Error getting employee info: {e}")
            return {
                'success': False,
                'message': "❌ An error occurred while retrieving employee information."
            }

    def list_employees(self, department: Optional[str] = None) -> Dict[str, Any]:
        """List employees (managers/admins only)"""
        try:
            if not self._can_view_all_attendance():
                return {
                    'success': False,
                    'message': "❌ You don't have permission to view all employees."
                }
            
            employees_query = Employee.objects.select_related('admin', 'department', 'division')
            
            if department:
                employees_query = employees_query.filter(department__name__icontains=department)
            
            employees = employees_query[:20]  # Limit to 20 employees
            
            employee_list = []
            for emp in employees:
                emp_info = {
                    'name': f"{emp.admin.first_name} {emp.admin.last_name}",
                    'email': emp.admin.email,
                    'department': emp.department.name if emp.department else 'Not assigned',
                    'division': emp.division.name if emp.division else 'Not assigned'
                }
                employee_list.append(emp_info)
            
            return {
                'success': True,
                'message': f"👥 Found {len(employee_list)} employees:",
                'employees': employee_list
            }
            
        except Exception as e:
            logger.error(f"Error listing employees: {e}")
            return {
                'success': False,
                'message': "❌ An error occurred while retrieving employee list."
            }


def execute_action(action_name: str, parameters: Dict[str, Any], user: CustomUser) -> Dict[str, Any]:
    """Execute an action based on the action name and parameters"""
    try:
        handler = ActionHandler(user)
        
        if action_name == 'create_task':
            return handler.create_task(
                employee_name=parameters.get('employee_name'),
                description=parameters.get('description'),
                priority=parameters.get('priority', 'medium')
            )
        elif action_name == 'get_tasks':
            return handler.get_tasks(
                employee_name=parameters.get('employee_name'),
                status=parameters.get('status')
            )
        elif action_name == 'list_all_tasks':
            # For admins to list all tasks in the system
            return handler.get_tasks(
                employee_name=None,  # This will trigger the admin view
                status=parameters.get('status')
            )
        elif action_name == 'list_all_attendance':
            # For admins to list all staff attendance
            return handler.get_attendance(
                employee_name=None,  # This will trigger the admin view
                date_from=parameters.get('date_from'),
                date_to=parameters.get('date_to')
            )
        elif action_name == 'get_attendance':
            return handler.get_attendance(
                employee_name=parameters.get('employee_name'),
                date_from=parameters.get('date_from'),
                date_to=parameters.get('date_to')
            )
        elif action_name == 'list_employees':
            return handler.list_employees(
                department=parameters.get('department')
            )
        elif action_name == 'get_employee_info':
            return handler.get_employee_info(
                employee_name=parameters.get('employee_name')
            )
        else:
            return {
                'success': False,
                'message': "❌ No employee profile found for your account. Please contact your administrator."
            }

    except Exception as e:
        logger.error(f"Error executing action {action_name}: {e}")
        return {
            'success': False,
            'message': f"❌ Error executing action: {str(e)}"
        }


def analyze_job_performance(user, message_data):
    """
    Analyze job performance using AI - Enhanced functionality from external repo
    """
    try:
        # Import the field processor
{{ ... }}
        
        message = message_data.get('message', '').lower()
        
        # Extract job card ID from message
        import re
        job_match = re.search(r'job(?:card)?\s*(?:id\s*)?(\d+)', message, re.IGNORECASE)
        
        if job_match:
            job_id = int(job_match.group(1))
            
            try:
                # Check if user has permission to access this job card
                from main_app.models import JobCard, JobCardAction
                
                job_card = JobCard.objects.get(id=job_id)
                
                # Check permissions
                if user.user_type == '3':  # Employee
                    if job_card.assigned_to != user:
                        return {
                            'success': False,
                            'message': "❌ You can only process field reports for your own job cards."
                        }
                elif user.user_type == '2':  # Manager  
                    # Managers can process reports for their team
                    pass
                elif user.user_type == '1':  # CEO
                    # CEO can process any report
                    pass
                
                # Find the latest action for this job card
                action = JobCardAction.objects.filter(jobcard=job_card).order_by('-created_at').first()
                
                if not action or not action.note_text:
                    return {
                        'success': False,
                        'message': f"❌ No field report text found for Job Card {job_id}. Please add notes to the job card first."
                    }
                
                # Process the field report
                processor = AIFieldProcessor()
                result = processor.process_field_report(action.id)
                
                # Format the response
                response_message = f"✅ **Field Report Processed Successfully for Job Card {job_id}**\n\n"
                
                if result.get('customer_name'):
                    response_message += f"👤 **Customer:** {result['customer_name']}\n"
                
                if result.get('contact_person'):
                    response_message += f"🤝 **Contact Person:** {result['contact_person']}\n"
                
                if result.get('visit_outcome'):
                    outcome_emoji = {
                        'order_taken': '📋',
                        'payment_collected': '💰',
                        'visit_completed': '✅',
                        'follow_up_needed': '📅'
                    }
                    emoji = outcome_emoji.get(result['visit_outcome'], '📝')
                    response_message += f"{emoji} **Outcome:** {result['visit_outcome'].replace('_', ' ').title()}\n"
                
                if result.get('order_details'):
                    order = result['order_details']
                    response_message += f"\n📦 **Order Details:**\n"
                    if order.get('quantity'):
                        response_message += f"   • Quantity: {order['quantity']}\n"
                    if order.get('rate'):
                        response_message += f"   • Rate: ₹{order['rate']}\n"
                
                if result.get('payment_details'):
                    payment = result['payment_details']
                    response_message += f"\n💳 **Payment Details:**\n"
                    if payment.get('amount'):
                        response_message += f"   • Amount: ₹{payment['amount']}\n"
                    if payment.get('method'):
                        response_message += f"   • Method: {payment['method'].title()}\n"
                
                if result.get('follow_up_required') == 'yes':
                    response_message += f"\n📅 **Follow-up Required:** Yes\n"
                    if result.get('follow_up_reason'):
                        response_message += f"   • Reason: {result['follow_up_reason']}\n"
                    if result.get('follow_up_date'):
                        response_message += f"   • Date: {result['follow_up_date']}\n"
                
                confidence = result.get('confidence', 0.0)
                if isinstance(confidence, (int, float)):
                    confidence_percent = int(confidence * 100)
                    response_message += f"\n🎯 **AI Confidence:** {confidence_percent}%\n"
                
                processing_method = result.get('processing_method', 'unknown')
                response_message += f"🤖 **Processing Method:** {processing_method.upper()}"
                
                return {
                    'success': True,
                    'message': response_message,
                    'data': {
                        'job_card_id': job_id,
                        'processed_data': result,
                        'action_id': action.id
                    }
                }
                
            except JobCard.DoesNotExist:
                return {
                    'success': False,
                    'message': f"❌ Job Card {job_id} not found."
                }
            except Exception as e:
                return {
                    'success': False,
                    'message': f"❌ Error processing field report: {str(e)}"
                }
        
        else:
            return {
                'success': False,
                'message': "❌ Please specify a job card ID.\n\n**Example:** 'Process field report for job card 123'"
            }
            
    except ImportError:
        return {
            'success': False,
            'message': "❌ Field report processing service not available. Please contact your administrator."
        }
    except Exception as e:
        return {
            'success': False,
            'message': f"❌ Unexpected error: {str(e)}"
        }


def analyze_job_performance(user, message_data):
    """
    Analyze job performance using AI field report data
    """
    try:
        from services.ai_field_processor import AIFieldProcessor
        
        message = message_data.get('message', '').lower()
        
        # Extract employee ID or use current user
        import re
        employee_match = re.search(r'employee\s*(?:id\s*)?(\d+)', message, re.IGNORECASE)
        days_match = re.search(r'(?:last|past)\s*(\d+)\s*days?', message, re.IGNORECASE)
        
        target_employee_id = user.id  # Default to current user
        days = 30  # Default to 30 days
        
        if employee_match:
            target_employee_id = int(employee_match.group(1))
            
            # Check permissions
            if user.user_type == '3' and target_employee_id != user.id:  # Employee
                return {
                    'success': False,
                    'message': "❌ You can only view your own performance analysis."
                }
        
        if days_match:
            days = int(days_match.group(1))
            days = min(days, 365)  # Limit to 1 year
        
        # Perform analysis
        processor = AIFieldProcessor()
        performance_data = processor.analyze_job_performance(target_employee_id, days)
        
        # Format response
        response_message = f"📊 **Job Performance Analysis**\n\n"
        response_message += f"👤 **Employee:** {performance_data['employee_name']}\n"
        response_message += f"📅 **Period:** {performance_data['analysis_period']}\n\n"
        
        response_message += f"📋 **Job Statistics:**\n"
        response_message += f"   • Total Jobs: {performance_data['total_jobs']}\n"
        response_message += f"   • Completed: {performance_data['completed_jobs']}\n"
        response_message += f"   • Pending: {performance_data['pending_jobs']}\n\n"
        
        response_message += f"💼 **Business Results:**\n"
        response_message += f"   • Orders Taken: {performance_data['orders_taken']}\n"
        response_message += f"   • Payments Collected: {performance_data['payments_collected']}\n"
        response_message += f"   • Follow-ups Generated: {performance_data['follow_ups_generated']}\n\n"
        
        score = performance_data['performance_score']
        score_emoji = "🟢" if score >= 80 else "🟡" if score >= 60 else "🔴"
        response_message += f"{score_emoji} **Performance Score:** {score:.1f}%\n"
        
        # Add performance insights
        if score >= 80:
            response_message += "\n🎉 **Excellent performance!** Keep up the great work."
        elif score >= 60:
            response_message += "\n👍 **Good performance.** Consider focusing on order conversion."
        else:
            response_message += "\n📈 **Room for improvement.** Consider additional training or support."
        
        return {
            'success': True,
            'message': response_message,
            'data': performance_data
        }
        
    except Exception as e:
        return {
            'success': False,
            'message': f"❌ Error analyzing performance: {str(e)}"
        }
