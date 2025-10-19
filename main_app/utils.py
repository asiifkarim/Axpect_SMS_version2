"""
Utility functions for main app
"""

from django.shortcuts import redirect
from django.contrib import messages
from django.urls import reverse


def get_home_for_user_type(user_type):
    """Get home URL for user type"""
    if user_type == '1':  # CEO/Admin
        return reverse('admin_home')
    elif user_type == '2':  # Manager
        return reverse('manager_home')
    elif user_type == '3':  # Employee
        return reverse('employee_home')
    else:
        return reverse('login_page')


def redirect_to_user_home(user_type):
    """Redirect user to their appropriate home page"""
    return redirect(get_home_for_user_type(user_type))


def validate_required_fields(request, required_fields):
    """Validate that required fields are present in request"""
    missing_fields = []
    for field in required_fields:
        if not request.POST.get(field):
            missing_fields.append(field)
    
    if missing_fields:
        return False, {
            'message': f'Missing required fields: {", ".join(missing_fields)}'
        }
    
    return True, {}


def add_error_message(request, message):
    """Add error message to request"""
    messages.error(request, message)


def add_success_message(request, message):
    """Add success message to request"""
    messages.success(request, message)


def get_attendance_stats(employee_or_departments, start_date=None, end_date=None):
    """Get attendance statistics for an employee or departments"""
    from .models import Attendance, AttendanceReport, Department
    from django.utils import timezone
    from datetime import timedelta
    
    if not start_date:
        start_date = timezone.now().date() - timedelta(days=30)
    if not end_date:
        end_date = timezone.now().date()
    
    # Check if input is a QuerySet of departments or a single employee
    if hasattr(employee_or_departments, 'model') and employee_or_departments.model == Department:
        # Handle departments QuerySet
        departments = employee_or_departments
        department_list = []
        attendance_list = []
        
        for department in departments:
            # Get attendance records for this department
            attendance_records = Attendance.objects.filter(
                department=department,
                date__range=[start_date, end_date]
            )
            
            # Get attendance reports for this department
            attendance_reports = AttendanceReport.objects.filter(
                attendance__in=attendance_records
            )
            
            total_days = len(attendance_records)
            present_days = attendance_reports.filter(status=True).count()
            absent_days = attendance_reports.filter(status=False).count()
            
            if total_days > 0:
                attendance_percentage = (present_days / total_days) * 100
            else:
                attendance_percentage = 0
            
            department_list.append(department.name)
            attendance_list.append({
                'total_days': total_days,
                'present_days': present_days,
                'absent_days': absent_days,
                'attendance_percentage': round(attendance_percentage, 2)
            })
        
        return department_list, attendance_list
    
    else:
        # Handle single employee
        employee = employee_or_departments
        
        # Get attendance records for the employee's department
        attendance_records = Attendance.objects.filter(
            department=employee.department,
            date__range=[start_date, end_date]
        )
        
        # Get attendance reports for this employee
        attendance_reports = AttendanceReport.objects.filter(
            employee=employee,
            attendance__in=attendance_records
        )
        
        total_days = len(attendance_records)
        present_days = attendance_reports.filter(status=True).count()
        absent_days = attendance_reports.filter(status=False).count()
        
        if total_days > 0:
            attendance_percentage = (present_days / total_days) * 100
        else:
            attendance_percentage = 0
        
        return {
            'total_days': total_days,
            'present_days': present_days,
            'absent_days': absent_days,
            'attendance_percentage': round(attendance_percentage, 2)
        }


def format_user_display_name(user):
    """Format user display name"""
    if hasattr(user, 'first_name') and hasattr(user, 'last_name'):
        return f"{user.first_name} {user.last_name}".strip()
    elif hasattr(user, 'email'):
        return user.email
    else:
        return str(user)