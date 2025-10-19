"""
Celery tasks for main app operations
"""

import logging
from celery import shared_task
from django.utils import timezone
from datetime import datetime, timedelta
from django.core.cache import cache

logger = logging.getLogger(__name__)


@shared_task
def system_health_check():
    """Perform system health check"""
    try:
        # Check database connectivity
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        # Check Redis connectivity (if available)
        try:
            cache.set('health_check', 'ok', 30)
            cache.get('health_check')
            cache_status = 'ok'
        except Exception:
            cache_status = 'warning'
        
        # Check critical models
        from main_app.models import Employee, JobCard, Customer
        employee_count = Employee.objects.count()
        jobcard_count = JobCard.objects.count()
        customer_count = Customer.objects.count()
        
        health_status = {
            'database': 'ok',
            'cache': cache_status,
            'employees': employee_count,
            'jobcards': jobcard_count,
            'customers': customer_count,
            'timestamp': timezone.now().isoformat()
        }
        
        logger.info(f"System health check completed: {health_status}")
        return health_status
        
    except Exception as e:
        logger.error(f"Error in system health check: {str(e)}")
        raise


@shared_task
def cleanup_expired_sessions():
    """Clean up expired sessions"""
    try:
        from django.contrib.sessions.models import Session
        
        # Clean up expired sessions
        expired_sessions = Session.objects.filter(expire_date__lt=timezone.now())
        deleted_count = expired_sessions.count()
        expired_sessions.delete()
        
        logger.info(f"Cleaned up {deleted_count} expired sessions")
        return f"Cleaned up {deleted_count} expired sessions"
        
    except Exception as e:
        logger.error(f"Error cleaning up expired sessions: {str(e)}")
        raise


@shared_task
def update_user_online_status():
    """Update user online status based on last activity"""
    try:
        from main_app.models import CustomUser
        
        # Mark users as offline if they haven't been active in the last 30 minutes
        cutoff_time = timezone.now() - timedelta(minutes=30)
        inactive_users = CustomUser.objects.filter(
            last_seen__lt=cutoff_time,
            is_online=True
        )
        
        updated_count = inactive_users.update(is_online=False)
        
        logger.info(f"Updated {updated_count} users to offline status")
        return f"Updated {updated_count} users to offline status"
        
    except Exception as e:
        logger.error(f"Error updating user online status: {str(e)}")
        raise


@shared_task
def generate_daily_reports():
    """Generate daily reports"""
    try:
        from main_app.models import Employee, JobCard, Attendance
        
        today = timezone.now().date()
        
        # Generate attendance report
        attendance_count = Attendance.objects.filter(date=today).count()
        
        # Generate job card report
        jobcard_count = JobCard.objects.filter(created_date__date=today).count()
        completed_jobcards = JobCard.objects.filter(
            created_date__date=today,
            status='COMPLETED'
        ).count()
        
        # Generate employee activity report
        active_employees = Employee.objects.filter(
            admin__last_seen__gte=timezone.now() - timedelta(hours=24)
        ).count()
        
        report = {
            'date': today.isoformat(),
            'attendance_count': attendance_count,
            'jobcard_count': jobcard_count,
            'completed_jobcards': completed_jobcards,
            'active_employees': active_employees,
            'completion_rate': completed_jobcards / jobcard_count if jobcard_count > 0 else 0
        }
        
        logger.info(f"Daily report generated: {report}")
        return report
        
    except Exception as e:
        logger.error(f"Error generating daily reports: {str(e)}")
        raise
