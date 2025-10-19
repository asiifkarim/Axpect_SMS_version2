"""
Celery tasks for API operations
"""

import logging
from celery import shared_task
from django.utils import timezone
from datetime import datetime, timedelta
from django.db.models import Sum, Count, Q
from django.core.mail import send_mail
from django.conf import settings

from main_app.models import (
    Employee, JobCard, Customer, Order, Payment, 
    StaffScoresDaily, CommunicationLog, CustomUser
)

logger = logging.getLogger(__name__)


@shared_task
def calculate_daily_scores():
    """Calculate daily scores for all staff members"""
    try:
        today = timezone.now().date()
        
        # Get all employees
        employees = Employee.objects.all()
        
        for employee in employees:
            # Calculate scores based on various metrics
            jobs_completed = JobCard.objects.filter(
                assigned_to=employee,
                status='COMPLETED',
                created_date__date=today
            ).count()
            
            orders_count = Order.objects.filter(
                created_by_staff=employee,
                order_date=today
            ).count()
            
            bales_total = Order.objects.filter(
                created_by_staff=employee,
                order_date=today
            ).aggregate(total=Sum('total_bales'))['total'] or 0
            
            payments_count = Payment.objects.filter(
                customer__owner_staff=employee,
                payment_date=today
            ).count()
            
            # Calculate points (simplified scoring system)
            points = (
                jobs_completed * 10 +
                orders_count * 5 +
                bales_total * 0.1 +
                payments_count * 15
            )
            
            # Create or update daily score record
            score_record, created = StaffScoresDaily.objects.get_or_create(
                staff=employee,
                date=today,
                defaults={
                    'jobs_completed': jobs_completed,
                    'orders_count': orders_count,
                    'bales_total': bales_total,
                    'payments_count': payments_count,
                    'points': points
                }
            )
            
            if not created:
                score_record.jobs_completed = jobs_completed
                score_record.orders_count = orders_count
                score_record.bales_total = bales_total
                score_record.payments_count = payments_count
                score_record.points = points
                score_record.save()
        
        logger.info(f"Daily scores calculated for {employees.count()} employees")
        return f"Daily scores calculated for {employees.count()} employees"
        
    except Exception as e:
        logger.error(f"Error calculating daily scores: {str(e)}")
        raise


@shared_task
def send_daily_notifications():
    """Send daily notifications to relevant users"""
    try:
        today = timezone.now().date()
        
        # Get employees with overdue tasks
        overdue_tasks = JobCard.objects.filter(
            due_date__lt=today,
            status__in=['PENDING', 'IN_PROGRESS']
        )
        
        for task in overdue_tasks:
            if task.assigned_to and task.assigned_to.admin.email:
                send_mail(
                    subject=f'Overdue Task: {task.title}',
                    message=f'Your task "{task.title}" is overdue. Please complete it as soon as possible.',
                    from_email=settings.EMAIL_ADDRESS,
                    recipient_list=[task.assigned_to.admin.email],
                    fail_silently=True
                )
        
        # Get managers with pending approvals
        pending_approvals = JobCard.objects.filter(
            status='PENDING',
            assigned_by__user_type='2'  # Managers
        )
        
        for approval in pending_approvals:
            if approval.assigned_by and approval.assigned_by.email:
                send_mail(
                    subject=f'Pending Approval: {approval.title}',
                    message=f'You have a pending job card approval: {approval.title}',
                    from_email=settings.EMAIL_ADDRESS,
                    recipient_list=[approval.assigned_by.email],
                    fail_silently=True
                )
        
        logger.info(f"Daily notifications sent for {overdue_tasks.count()} overdue tasks and {pending_approvals.count()} pending approvals")
        return f"Daily notifications sent for {overdue_tasks.count()} overdue tasks and {pending_approvals.count()} pending approvals"
        
    except Exception as e:
        logger.error(f"Error sending daily notifications: {str(e)}")
        raise


@shared_task
def sync_google_drive_data():
    """Sync data with Google Drive (placeholder)"""
    try:
        # This is a placeholder for Google Drive sync
        # In production, you would implement actual Google Drive API calls
        logger.info("Google Drive sync completed (placeholder)")
        return "Google Drive sync completed (placeholder)"
        
    except Exception as e:
        logger.error(f"Error syncing Google Drive data: {str(e)}")
        raise


@shared_task
def generate_automatic_jobcards():
    """Generate automatic job cards based on business rules"""
    try:
        today = timezone.now().date()
        
        # Generate follow-up job cards for customers with recent orders
        recent_orders = Order.objects.filter(
            order_date__gte=today - timedelta(days=7),
            status='CONFIRMED'
        )
        
        created_count = 0
        for order in recent_orders:
            if order.customer and order.created_by_staff:
                # Create follow-up job card
                JobCard.objects.get_or_create(
                    assigned_to=order.created_by_staff,
                    assigned_by=order.created_by_staff,
                    description=f"Follow up on order #{order.id} for {order.customer.name}",
                    type='FOLLOWUP',
                    priority='MEDIUM',
                    due_date=timezone.now() + timedelta(days=3),
                    customer=order.customer,
                    city=order.customer.city
                )
                created_count += 1
        
        logger.info(f"Generated {created_count} automatic job cards")
        return f"Generated {created_count} automatic job cards"
        
    except Exception as e:
        logger.error(f"Error generating automatic job cards: {str(e)}")
        raise


@shared_task
def cleanup_old_sessions():
    """Clean up old session data"""
    try:
        # Clean up old communication logs (older than 1 year)
        cutoff_date = timezone.now() - timedelta(days=365)
        old_logs = CommunicationLog.objects.filter(timestamp__lt=cutoff_date)
        deleted_count = old_logs.count()
        old_logs.delete()
        
        logger.info(f"Cleaned up {deleted_count} old communication logs")
        return f"Cleaned up {deleted_count} old communication logs"
        
    except Exception as e:
        logger.error(f"Error cleaning up old sessions: {str(e)}")
        raise


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
            from django.core.cache import cache
            cache.set('health_check', 'ok', 30)
            cache.get('health_check')
        except Exception:
            logger.warning("Redis cache not available")
        
        # Check critical models
        employee_count = Employee.objects.count()
        jobcard_count = JobCard.objects.count()
        customer_count = Customer.objects.count()
        
        health_status = {
            'database': 'ok',
            'cache': 'warning' if not cache else 'ok',
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
def process_field_report(action_id):
    """
    Process AI field report from JobCardAction
    This task processes field reports submitted through job card actions
    """
    try:
        from main_app.models import JobCardAction
        from services.ai_field_processor import AIFieldProcessor
        
        logger.info(f"Processing field report for action ID: {action_id}")
        
        # Get the job card action
        action = JobCardAction.objects.get(id=action_id)
        
        # Initialize AI field processor
        processor = AIFieldProcessor()
        
        # Process the field report
        result = processor.process_field_report(action)
        
        logger.info(f"Field report processed successfully for action {action_id}")
        return {
            'status': 'success',
            'action_id': action_id,
            'result': result
        }
        
    except JobCardAction.DoesNotExist:
        logger.error(f"JobCardAction with ID {action_id} not found")
        return {'status': 'error', 'message': 'Action not found'}
    except Exception as e:
        logger.error(f"Error processing field report for action {action_id}: {str(e)}")
        return {'status': 'error', 'message': str(e)}


@shared_task
def process_whatsapp_messages():
    """
    Process pending WhatsApp messages
    This task processes incoming WhatsApp messages and creates appropriate responses
    """
    try:
        from main_app.models import CommunicationLog, Customer
        from django.utils import timezone
        from datetime import timedelta
        
        logger.info("Processing pending WhatsApp messages")
        
        # Get recent WhatsApp messages that haven't been processed
        recent_time = timezone.now() - timedelta(minutes=5)
        pending_messages = CommunicationLog.objects.filter(
            channel='WHATSAPP',
            created_at__gte=recent_time,
            processed=False
        )
        
        processed_count = 0
        for message in pending_messages:
            try:
                # Process the WhatsApp message
                # This could include:
                # - Auto-reply based on keywords
                # - Route to appropriate employee
                # - Create job cards for customer requests
                # - Update customer information
                
                # For now, just mark as processed
                message.processed = True
                message.save()
                processed_count += 1
                
                logger.info(f"Processed WhatsApp message ID: {message.id}")
                
            except Exception as e:
                logger.error(f"Error processing WhatsApp message {message.id}: {str(e)}")
                continue
        
        logger.info(f"Processed {processed_count} WhatsApp messages")
        return {
            'status': 'success',
            'processed_count': processed_count
        }
        
    except Exception as e:
        logger.error(f"Error in process_whatsapp_messages: {str(e)}")
        return {'status': 'error', 'message': str(e)}