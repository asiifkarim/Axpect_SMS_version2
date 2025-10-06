import os
from celery import Celery
from django.conf import settings
from celery.schedules import crontab

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'axpect_tech_config.settings')

app = Celery('axpect_tech')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Production-optimized Celery configuration
app.conf.update(
    # Task routing
    task_routes={
        'api.tasks.calculate_daily_scores': {'queue': 'high_priority'},
        'api.tasks.send_daily_notifications': {'queue': 'notifications'},
        'api.tasks.sync_google_drive_data': {'queue': 'background'},
        'ai.tasks.*': {'queue': 'ai_processing'},
    },
    
    # Task execution settings
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    
    # Performance settings
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    worker_max_tasks_per_child=1000,
    
    # Result backend settings
    result_expires=3600,  # 1 hour
    result_backend_transport_options={
        'master_name': 'mymaster',
        'visibility_timeout': 3600,
    },
    
    # Error handling
    task_reject_on_worker_lost=True,
    task_ignore_result=False,
    
    # Security
    worker_hijack_root_logger=False,
    worker_log_color=False,
)

# Celery Beat Schedule for periodic tasks
app.conf.beat_schedule = {
    # Daily tasks at specific times
    'calculate-daily-scores': {
        'task': 'api.tasks.calculate_daily_scores',
        'schedule': crontab(hour=0, minute=0),  # Daily at midnight
        'options': {'queue': 'high_priority'}
    },
    
    # Regular maintenance tasks
    'generate-automatic-jobcards': {
        'task': 'api.tasks.generate_automatic_jobcards',
        'schedule': crontab(hour='*/8'),  # Every 8 hours
        'options': {'queue': 'background'}
    },
    
    # Notification tasks
    'send-daily-notifications': {
        'task': 'api.tasks.send_daily_notifications',
        'schedule': crontab(hour=9, minute=0),  # Daily at 9 AM
        'options': {'queue': 'notifications'}
    },
    
    # Data synchronization
    'sync-google-drive': {
        'task': 'api.tasks.sync_google_drive_data',
        'schedule': crontab(hour=2, minute=0),  # Daily at 2 AM
        'options': {'queue': 'background'}
    },
    
    # AI model maintenance
    'cleanup-ai-conversations': {
        'task': 'ai.tasks.cleanup_old_conversations',
        'schedule': crontab(hour=3, minute=0, day_of_week=0),  # Weekly on Sunday at 3 AM
        'options': {'queue': 'ai_processing'}
    },
    
    # System health checks
    'system-health-check': {
        'task': 'main_app.tasks.system_health_check',
        'schedule': crontab(minute='*/30'),  # Every 30 minutes
        'options': {'queue': 'monitoring'}
    },
    
    # Database cleanup
    'cleanup-old-sessions': {
        'task': 'main_app.tasks.cleanup_expired_sessions',
        'schedule': crontab(hour=1, minute=0),  # Daily at 1 AM
        'options': {'queue': 'background'}
    },
}

# Queue configuration for different types of tasks
app.conf.task_default_queue = 'default'
app.conf.task_default_exchange = 'default'
app.conf.task_default_exchange_type = 'direct'
app.conf.task_default_routing_key = 'default'

# Define queues
app.conf.task_queues = {
    'default': {
        'exchange': 'default',
        'routing_key': 'default',
    },
    'high_priority': {
        'exchange': 'high_priority',
        'routing_key': 'high_priority',
    },
    'notifications': {
        'exchange': 'notifications',
        'routing_key': 'notifications',
    },
    'background': {
        'exchange': 'background',
        'routing_key': 'background',
    },
    'ai_processing': {
        'exchange': 'ai_processing',
        'routing_key': 'ai_processing',
    },
    'monitoring': {
        'exchange': 'monitoring',
        'routing_key': 'monitoring',
    },
}


@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')


@app.task(bind=True, autoretry_for=(Exception,), retry_kwargs={'max_retries': 3, 'countdown': 60})
def health_check_task(self):
    """Periodic health check task for monitoring system status"""
    from django.core.management import call_command
    from io import StringIO
    import sys
    
    # Capture health check output
    old_stdout = sys.stdout
    sys.stdout = buffer = StringIO()
    
    try:
        call_command('health_check')
        output = buffer.getvalue()
        sys.stdout = old_stdout
        
        # Log the health check results
        print(f"Health check completed: {output}")
        return {"status": "healthy", "output": output}
    except Exception as e:
        sys.stdout = old_stdout
        print(f"Health check failed: {str(e)}")
        raise self.retry(exc=e)
