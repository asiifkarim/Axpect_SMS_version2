from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from main_app.models import (
    Department, CustomUser, ChatGroup, ChatGroupMember, 
    SocialNotificationSettings, SocialAuditLog
)
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Department)
def create_department_chat_group(sender, instance, created, **kwargs):
    """Automatically create a chat group when a new department is created"""
    if created:
        try:
            group = ChatGroup.objects.create(
                name=f"{instance.name} Team Chat",
                group_type='DEPARTMENT',
                description=f"Team chat for {instance.name} department",
                department=instance,
                is_active=True,
                allow_file_sharing=True
            )
            
            # Add all employees in this department to the group
            employees = instance.employee_set.all()
            for employee in employees:
                ChatGroupMember.objects.create(
                    group=group,
                    user=employee.admin,
                    role='MEMBER',
                    is_active=True
                )
            
            # Add department managers to the group as admins
            managers = instance.division.manager_set.all() if instance.division else []
            for manager in managers:
                ChatGroupMember.objects.create(
                    group=group,
                    user=manager.admin,
                    role='ADMIN',
                    is_active=True
                )
                
            logger.info(f"Created department chat group: {group.name}")
            
        except Exception as e:
            logger.error(f"Error creating department chat group: {str(e)}")


@receiver(post_save, sender=CustomUser)
def create_social_notification_settings(sender, instance, created, **kwargs):
    """Create default social notification settings for new users"""
    if created:
        try:
            SocialNotificationSettings.objects.create(
                user=instance,
                desktop_notifications=True,
                email_notifications=False,
                sound_notifications=True,
                weekend_notifications=True,
                mute_all_groups=False,
                only_mentions=False,
                drive_share_notifications=True,
                drive_sync_notifications=False
            )
            logger.info(f"Created social notification settings for user: {instance.email}")
        except Exception as e:
            logger.error(f"Error creating social notification settings: {str(e)}")


@receiver(post_save, sender=CustomUser)
def add_user_to_department_groups(sender, instance, created, **kwargs):
    """Add new employees to their department chat groups"""
    if created and hasattr(instance, 'employee'):
        try:
            employee = instance.employee
            if employee.department:
                # Find department chat group
                department_groups = ChatGroup.objects.filter(
                    department=employee.department,
                    group_type='DEPARTMENT',
                    is_active=True
                )
                
                for group in department_groups:
                    ChatGroupMember.objects.get_or_create(
                        group=group,
                        user=instance,
                        defaults={
                            'role': 'MEMBER',
                            'is_active': True
                        }
                    )
                    
                logger.info(f"Added user {instance.email} to department groups")
                
        except Exception as e:
            logger.error(f"Error adding user to department groups: {str(e)}")


def log_social_activity(user, action, **kwargs):
    """Helper function to log social activities"""
    try:
        SocialAuditLog.objects.create(
            user=user,
            action=action,
            group=kwargs.get('group'),
            message=kwargs.get('message'),
            target_user=kwargs.get('target_user'),
            details=kwargs.get('details'),
            ip_address=kwargs.get('ip_address'),
            user_agent=kwargs.get('user_agent')
        )
    except Exception as e:
        logger.error(f"Error logging social activity: {str(e)}")


# Signal handlers for audit logging
@receiver(post_save, sender=ChatGroup)
def log_group_creation(sender, instance, created, **kwargs):
    """Log group creation"""
    if created and instance.created_by:
        log_social_activity(
            user=instance.created_by,
            action='GROUP_CREATED',
            group=instance,
            details={'group_type': instance.group_type}
        )


@receiver(post_save, sender=ChatGroupMember)
def log_group_membership(sender, instance, created, **kwargs):
    """Log group membership changes"""
    if created:
        log_social_activity(
            user=instance.user,
            action='GROUP_JOINED',
            group=instance.group,
            details={'role': instance.role}
        )


@receiver(post_delete, sender=ChatGroupMember)
def log_group_leave(sender, instance, **kwargs):
    """Log when user leaves group"""
    log_social_activity(
        user=instance.user,
        action='GROUP_LEFT',
        group=instance.group,
        details={'role': instance.role}
    )
