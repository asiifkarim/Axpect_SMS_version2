"""
Notification Helper Functions
Centralized notification creation for all features
"""

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.utils import timezone
import logging

from .models import (
    NotificationEmployee, NotificationManager, NotificationAdmin,
    Employee, Manager, Admin, CustomUser
)

logger = logging.getLogger(__name__)


def get_leave_url_for_user(user, applicant_type='employee'):
    """
    Get appropriate leave URL based on user type
    
    Args:
        user: CustomUser instance
        applicant_type: 'employee' or 'manager'
    
    Returns:
        str: URL for viewing leave requests
    """
    if user.user_type == '1':  # Admin
        if applicant_type == 'employee':
            return '/ceo/view_employee_leave/'
        else:
            return '/ceo/view_manager_leave/'
    elif user.user_type == '2':  # Manager
        return '/manager/view_employee_leave/'
    return '#'


def get_task_url_for_user(task, user):
    """
    Get appropriate task/job card URL based on user type
    
    Args:
        task: EmployeeTask or JobCard instance
        user: CustomUser instance
    
    Returns:
        str: URL for viewing the task
    """
    if hasattr(task, 'job_card_number'):  # JobCard
        if user.user_type == '1':  # Admin
            return '/admin/job-card-dashboard/'
        elif user.user_type == '2':  # Manager
            return '/manager/job-card-dashboard/'
        else:  # Employee
            return '/employee/jobcards/'
    else:  # EmployeeTask
        # For employee tasks, redirect to appropriate dashboard
        if user.user_type == '1':
            return '/admin/job-card-dashboard/'
        elif user.user_type == '2':
            return '/manager/job-card-dashboard/'
        else:
            return '/employee/jobcards/'
    return '#'


def get_customer_url_for_user(customer, user):
    """
    Get appropriate customer URL based on user type
    
    Args:
        customer: Customer instance
        user: CustomUser instance
    
    Returns:
        str: URL for viewing the customer
    """
    if user.user_type == '1':  # Admin
        return f'/customers/{customer.id}/edit/'
    return '/customers/manage/'


def send_notification_to_user(user_id, notification_type, title, message, **extra_data):
    """
    Send notification via WebSocket to a specific user
    
    Args:
        user_id: ID of the user to notify
        notification_type: Type of notification (leave, attendance, job, message, etc.)
        title: Notification title
        message: Notification message
        **extra_data: Additional data to include in notification (including redirect_url)
    """
    try:
        channel_layer = get_channel_layer()
        if channel_layer:
            notification_data = {
                'id': f'{notification_type}_{user_id}_{timezone.now().timestamp()}',
                'type': notification_type,
                'title': title,
                'message': message,
                'level': extra_data.get('level', 'info'),
                'created_at': timezone.now().isoformat(),
                'redirect_url': extra_data.get('redirect_url', '#')
            }
            
            # Add any extra data (excluding redirect_url as it's already added)
            for key, value in extra_data.items():
                if key not in ['level', 'sound_type', 'redirect_url']:
                    notification_data[key] = value
            
            async_to_sync(channel_layer.group_send)(
                f'notifications_{user_id}',
                {
                    'type': 'notification_message',
                    'notification': notification_data,
                    'sound_type': extra_data.get('sound_type', notification_type)
                }
            )
            logger.info(f"Sent {notification_type} notification to user {user_id}")
    except Exception as e:
        logger.error(f"Error sending WebSocket notification: {str(e)}")


def create_employee_notification(employee, message, notification_type='general', **extra_data):
    """
    Create notification for an employee
    
    Args:
        employee: Employee instance
        message: Notification message
        notification_type: Type of notification
        **extra_data: Additional data for WebSocket notification
    """
    try:
        # Create database notification
        NotificationEmployee.objects.create(
            employee=employee,
            message=message
        )
        
        # Send WebSocket notification
        if employee.admin:
            send_notification_to_user(
                user_id=employee.admin.id,
                notification_type=notification_type,
                title=get_notification_title(notification_type),
                message=message,
                **extra_data
            )
        
        logger.info(f"Created {notification_type} notification for employee {employee.id}")
    except Exception as e:
        logger.error(f"Error creating employee notification: {str(e)}")


def create_manager_notification(manager, message, notification_type='general', **extra_data):
    """
    Create notification for a manager
    
    Args:
        manager: Manager instance
        message: Notification message
        notification_type: Type of notification
        **extra_data: Additional data for WebSocket notification
    """
    try:
        # Create database notification
        NotificationManager.objects.create(
            manager=manager,
            message=message
        )
        
        # Send WebSocket notification
        if manager.admin:
            send_notification_to_user(
                user_id=manager.admin.id,
                notification_type=notification_type,
                title=get_notification_title(notification_type),
                message=message,
                **extra_data
            )
        
        logger.info(f"Created {notification_type} notification for manager {manager.id}")
    except Exception as e:
        logger.error(f"Error creating manager notification: {str(e)}")


def create_admin_notification(admin, message, notification_type='general', **extra_data):
    """
    Create notification for an admin
    
    Args:
        admin: Admin instance
        message: Notification message
        notification_type: Type of notification
        **extra_data: Additional data for WebSocket notification
    """
    try:
        # Create database notification
        NotificationAdmin.objects.create(
            admin=admin,
            message=message
        )
        
        # Send WebSocket notification
        if admin.admin:
            send_notification_to_user(
                user_id=admin.admin.id,
                notification_type=notification_type,
                title=get_notification_title(notification_type),
                message=message,
                **extra_data
            )
        
        logger.info(f"Created {notification_type} notification for admin {admin.id}")
    except Exception as e:
        logger.error(f"Error creating admin notification: {str(e)}")


def notify_leave_application(leave_report, applicant_type='employee'):
    """
    Notify admin/managers when someone applies for leave
    
    Args:
        leave_report: LeaveReportEmployee or LeaveReportManager instance
        applicant_type: 'employee' or 'manager'
    """
    try:
        if applicant_type == 'employee':
            applicant_name = f"{leave_report.employee.admin.first_name} {leave_report.employee.admin.last_name}"
            message = f"{applicant_name} has applied for leave on {leave_report.date}"
        else:
            applicant_name = f"{leave_report.manager.admin.first_name} {leave_report.manager.admin.last_name}"
            message = f"Manager {applicant_name} has applied for leave on {leave_report.date}"
        
        # Notify all admins
        admins = Admin.objects.all()
        for admin in admins:
            redirect_url = get_leave_url_for_user(admin.admin, applicant_type)
            create_admin_notification(
                admin=admin,
                message=message,
                notification_type='leave_application',
                level='warning',
                leave_id=leave_report.id,
                redirect_url=redirect_url
            )
        
        # Notify all managers
        managers = Manager.objects.all()
        for manager in managers:
            redirect_url = get_leave_url_for_user(manager.admin, applicant_type)
            create_manager_notification(
                manager=manager,
                message=message,
                notification_type='leave_application',
                level='warning',
                leave_id=leave_report.id,
                redirect_url=redirect_url
            )
        
        logger.info(f"Sent leave application notifications for {applicant_name}")
    except Exception as e:
        logger.error(f"Error notifying leave application: {str(e)}")


def notify_leave_status(leave_report, status, applicant_type='employee'):
    """
    Notify employee/manager when their leave is approved/rejected
    
    Args:
        leave_report: LeaveReportEmployee or LeaveReportManager instance
        status: 1 (approved) or -1 (rejected)
        applicant_type: 'employee' or 'manager'
    """
    try:
        status_text = "approved" if status == 1 else "rejected"
        message = f"Your leave application for {leave_report.date} has been {status_text}"
        
        if applicant_type == 'employee':
            create_employee_notification(
                employee=leave_report.employee,
                message=message,
                notification_type='leave_status',
                level='success' if status == 1 else 'danger',
                leave_id=leave_report.id,
                status=status_text
            )
        else:
            create_manager_notification(
                manager=leave_report.manager,
                message=message,
                notification_type='leave_status',
                level='success' if status == 1 else 'danger',
                leave_id=leave_report.id,
                status=status_text
            )
        
        logger.info(f"Sent leave {status_text} notification")
    except Exception as e:
        logger.error(f"Error notifying leave status: {str(e)}")


def notify_checkin(employee, location=''):
    """
    Notify manager when employee checks in
    
    Args:
        employee: Employee instance
        location: Check-in location (optional)
    """
    try:
        employee_name = f"{employee.admin.first_name} {employee.admin.last_name}"
        time_str = timezone.now().strftime('%I:%M %p')
        message = f"{employee_name} checked in at {time_str}"
        
        if location:
            message += f" from {location}"
        
        # Notify employee's manager (if they have one)
        if hasattr(employee, 'division') and employee.division:
            managers = Manager.objects.filter(division=employee.division)
            for manager in managers:
                create_manager_notification(
                    manager=manager,
                    message=message,
                    notification_type='attendance',
                    level='info',
                    employee_id=employee.id
                )
        
        logger.info(f"Sent check-in notification for employee {employee.id}")
    except Exception as e:
        logger.error(f"Error notifying check-in: {str(e)}")


def notify_checkout(employee, location='', duration_hours=None):
    """
    Notify manager when employee checks out
    
    Args:
        employee: Employee instance
        location: Check-out location (optional)
        duration_hours: Work duration in hours (optional)
    """
    try:
        employee_name = f"{employee.admin.first_name} {employee.admin.last_name}"
        time_str = timezone.now().strftime('%I:%M %p')
        message = f"{employee_name} checked out at {time_str}"
        
        if duration_hours:
            message += f" (worked {duration_hours:.1f} hours)"
        
        if location:
            message += f" from {location}"
        
        # Notify employee's manager
        if hasattr(employee, 'division') and employee.division:
            managers = Manager.objects.filter(division=employee.division)
            for manager in managers:
                create_manager_notification(
                    manager=manager,
                    message=message,
                    notification_type='attendance',
                    level='info',
                    employee_id=employee.id
                )
        
        logger.info(f"Sent check-out notification for employee {employee.id}")
    except Exception as e:
        logger.error(f"Error notifying check-out: {str(e)}")


def notify_attendance_updated(employee, updated_by, notes=''):
    """
    Notify employee when their attendance is updated
    
    Args:
        employee: Employee instance
        updated_by: User who updated the attendance
        notes: Update notes (optional)
    """
    try:
        updater_name = f"{updated_by.first_name} {updated_by.last_name}"
        message = f"Your attendance has been updated by {updater_name}"
        
        if notes:
            message += f": {notes}"
        
        create_employee_notification(
            employee=employee,
            message=message,
            notification_type='attendance',
            level='warning'
        )
        
        logger.info(f"Sent attendance update notification to employee {employee.id}")
    except Exception as e:
        logger.error(f"Error notifying attendance update: {str(e)}")


def notify_feedback_reply(feedback, user_type='employee'):
    """
    Notify when feedback receives a reply
    
    Args:
        feedback: FeedbackEmployee or FeedbackManager instance
        user_type: 'employee' or 'manager'
    """
    try:
        message = "You have received a reply to your feedback"
        
        if user_type == 'employee':
            create_employee_notification(
                employee=feedback.employee,
                message=message,
                notification_type='feedback',
                level='info',
                feedback_id=feedback.id
            )
        else:
            create_manager_notification(
                manager=feedback.manager,
                message=message,
                notification_type='feedback',
                level='info',
                feedback_id=feedback.id
            )
        
        logger.info(f"Sent feedback reply notification")
    except Exception as e:
        logger.error(f"Error notifying feedback reply: {str(e)}")


def notify_task_assignment(task, assigned_to_type='employee'):
    """
    Notify admin when a task is assigned
    
    Args:
        task: EmployeeTask or JobCard instance
        assigned_to_type: 'employee' or 'manager'
    """
    try:
        # Determine task details
        if hasattr(task, 'job_card_number'):  # JobCard
            task_name = f"Job Card #{task.job_card_number}"
            assignee_name = task.assigned_to.get_full_name() if task.assigned_to else "Unassigned"
        else:  # EmployeeTask
            task_name = task.title
            assignee_name = f"{task.employee.admin.first_name} {task.employee.admin.last_name}"
        
        message = f"Task '{task_name}' has been assigned to {assignee_name}"
        
        # Notify all admins
        admins = Admin.objects.all()
        for admin in admins:
            redirect_url = get_task_url_for_user(task, admin.admin)
            create_admin_notification(
                admin=admin,
                message=message,
                notification_type='task_assignment',
                level='info',
                task_id=task.id,
                redirect_url=redirect_url
            )
        
        logger.info(f"Sent task assignment notifications for {task_name}")
    except Exception as e:
        logger.error(f"Error notifying task assignment: {str(e)}")


def notify_task_update(task, old_status, new_status, updated_by):
    """
    Notify admin when a task status is updated
    
    Args:
        task: EmployeeTask or JobCard instance
        old_status: Previous status
        new_status: New status
        updated_by: User who updated the task
    """
    try:
        # Determine task details
        if hasattr(task, 'job_card_number'):  # JobCard
            task_name = f"Job Card #{task.job_card_number}"
        else:  # EmployeeTask
            task_name = task.title
        
        updater_name = updated_by.get_full_name() if updated_by else "System"
        message = f"{updater_name} updated '{task_name}' status from {old_status} to {new_status}"
        
        # Notify all admins
        admins = Admin.objects.all()
        for admin in admins:
            redirect_url = get_task_url_for_user(task, admin.admin)
            create_admin_notification(
                admin=admin,
                message=message,
                notification_type='task_update',
                level='info',
                task_id=task.id,
                old_status=old_status,
                new_status=new_status,
                redirect_url=redirect_url
            )
        
        logger.info(f"Sent task update notifications for {task_name}")
    except Exception as e:
        logger.error(f"Error notifying task update: {str(e)}")


def notify_customer_addition(customer, created_by):
    """
    Notify admin when a new customer is added
    
    Args:
        customer: Customer instance
        created_by: User who created the customer
    """
    try:
        creator_name = created_by.get_full_name() if created_by else "System"
        message = f"New customer '{customer.name}' has been added by {creator_name}"
        
        # Notify all admins
        admins = Admin.objects.all()
        for admin in admins:
            redirect_url = get_customer_url_for_user(customer, admin.admin)
            create_admin_notification(
                admin=admin,
                message=message,
                notification_type='customer_addition',
                level='success',
                customer_id=customer.id,
                redirect_url=redirect_url
            )
        
        logger.info(f"Sent customer addition notifications for {customer.name}")
    except Exception as e:
        logger.error(f"Error notifying customer addition: {str(e)}")


def get_notification_title(notification_type):
    """
    Get appropriate title for notification type
    
    Args:
        notification_type: Type of notification
        
    Returns:
        str: Notification title
    """
    titles = {
        'leave_application': 'Leave Application',
        'leave_status': 'Leave Status Update',
        'attendance': 'Attendance Update',
        'job_assignment': 'New Job Assignment',
        'task_assignment': 'Task Assignment',
        'task_update': 'Task Update',
        'message': 'New Message',
        'feedback': 'Feedback Reply',
        'customer_addition': 'New Customer',
        'general': 'Notification'
    }
    return titles.get(notification_type, 'Notification')

