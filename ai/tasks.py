"""
Celery tasks for AI operations
"""

import logging
from celery import shared_task
from django.utils import timezone
from datetime import datetime, timedelta
from django.db.models import Q

from main_app.models import CustomUser, JobCardAction, AIProcessingLog

logger = logging.getLogger(__name__)


@shared_task
def cleanup_old_conversations():
    """Clean up old AI conversation data"""
    try:
        # Clean up old AI processing logs (older than 30 days)
        cutoff_date = timezone.now() - timedelta(days=30)
        old_logs = AIProcessingLog.objects.filter(created_at__lt=cutoff_date)
        deleted_count = old_logs.count()
        old_logs.delete()
        
        logger.info(f"Cleaned up {deleted_count} old AI processing logs")
        return f"Cleaned up {deleted_count} old AI processing logs"
        
    except Exception as e:
        logger.error(f"Error cleaning up old conversations: {str(e)}")
        raise


@shared_task
def process_field_report_async(jobcard_action_id, report_text):
    """Process field report asynchronously"""
    try:
        from .llm_handler import LLMHandler
        
        # Get the job card action
        try:
            jobcard_action = JobCardAction.objects.get(id=jobcard_action_id)
        except JobCardAction.DoesNotExist:
            logger.error(f"JobCardAction {jobcard_action_id} not found")
            return
        
        # Create AI processing log
        ai_log = AIProcessingLog.objects.create(
            jobcard_action=jobcard_action,
            input_text=report_text,
            status='PROCESSING'
        )
        
        # Process the report
        llm_handler = LLMHandler()
        result = llm_handler.process_field_report(report_text)
        
        if result['success']:
            ai_log.processed_data = result['structured_data']
            ai_log.confidence_score = result.get('confidence_score', 0.0)
            ai_log.status = 'COMPLETED'
            ai_log.processed_at = timezone.now()
        else:
            ai_log.status = 'FAILED'
            ai_log.error_message = result.get('error', 'Unknown error')
        
        ai_log.save()
        
        logger.info(f"Field report processed for JobCardAction {jobcard_action_id}")
        return f"Field report processed for JobCardAction {jobcard_action_id}"
        
    except Exception as e:
        logger.error(f"Error processing field report: {str(e)}")
        raise


@shared_task
def generate_ai_insights():
    """Generate AI insights from system data"""
    try:
        # This is a placeholder for AI insights generation
        # In production, you would implement actual AI analysis
        
        # Example: Analyze job card completion patterns
        recent_jobcards = JobCard.objects.filter(
            created_date__gte=timezone.now() - timedelta(days=30)
        )
        
        completion_rate = recent_jobcards.filter(status='COMPLETED').count() / recent_jobcards.count() if recent_jobcards.count() > 0 else 0
        
        insights = {
            'completion_rate': completion_rate,
            'total_jobcards': recent_jobcards.count(),
            'completed_jobcards': recent_jobcards.filter(status='COMPLETED').count(),
            'timestamp': timezone.now().isoformat()
        }
        
        logger.info(f"AI insights generated: {insights}")
        return insights
        
    except Exception as e:
        logger.error(f"Error generating AI insights: {str(e)}")
        raise


@shared_task
def optimize_ai_models():
    """Optimize AI models and configurations"""
    try:
        # This is a placeholder for AI model optimization
        # In production, you would implement actual model optimization
        
        logger.info("AI models optimization completed (placeholder)")
        return "AI models optimization completed (placeholder)"
        
    except Exception as e:
        logger.error(f"Error optimizing AI models: {str(e)}")
        raise
