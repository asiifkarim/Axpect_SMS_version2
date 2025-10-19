"""
Enhanced Notification API Views
Provides endpoints for real-time notifications and job card assignments
"""

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
import json

from main_app.models import (
    NotificationManager, NotificationEmployee, JobCard, 
    Employee, Manager, CustomUser
)


@login_required
@require_http_methods(["GET"])
def pending_notifications(request):
    """Get pending notifications for the current user"""
    try:
        notifications = []
        
        # Handle admin users (user_type == '1')
        if request.user.user_type == '1':  # Admin/CEO
            # Admins can see notifications from all sources
            # For now, we'll return empty notifications for admin
            # This can be enhanced to show system-wide notifications
            pass
            
        elif request.user.user_type == '2':  # Manager
            try:
                manager = Manager.objects.get(admin=request.user)
                manager_notifications = NotificationManager.objects.filter(
                    manager=manager,
                    is_read=False,
                    created_at__gte=timezone.now() - timezone.timedelta(hours=24)
                ).order_by('-created_at')[:10]
                
                for notification in manager_notifications:
                    notifications.append({
                        'id': notification.id,
                        'type': 'general',
                        'title': 'New Notification',
                        'message': notification.message,
                        'created_at': notification.created_at.isoformat(),
                        'level': 'info'
                    })
            except Manager.DoesNotExist:
                pass
                
        elif request.user.user_type == '3':  # Employee
            try:
                employee = Employee.objects.get(admin=request.user)
                employee_notifications = NotificationEmployee.objects.filter(
                    employee=employee,
                    is_read=False,
                    created_at__gte=timezone.now() - timezone.timedelta(hours=24)
                ).order_by('-created_at')[:10]
                
                for notification in employee_notifications:
                    notifications.append({
                        'id': notification.id,
                        'type': 'general',
                        'title': 'New Notification',
                        'message': notification.message,
                        'created_at': notification.created_at.isoformat(),
                        'level': 'info'
                    })
            except Employee.DoesNotExist:
                pass
        
        # Check for recent job card assignments
        try:
            recent_assignments = JobCard.objects.filter(
                assigned_to__admin=request.user,
                created_date__gte=timezone.now() - timezone.timedelta(hours=1)
            ).select_related('assigned_by', 'customer')
            
            for job_card in recent_assignments:
                notifications.append({
                    'id': f'job_{job_card.id}',
                    'type': 'job_assignment',
                    'title': 'New Job Assignment',
                    'message': f'You have been assigned Job Card #{job_card.job_card_number}',
                    'job_card': {
                        'id': job_card.id,
                        'number': job_card.job_card_number,
                        'type': job_card.type,
                        'priority': job_card.priority,
                        'due_date': job_card.due_date.isoformat() if job_card.due_date else None
                    },
                    'assigned_by': job_card.assigned_by.get_full_name() if job_card.assigned_by else 'System',
                    'created_at': job_card.created_date.isoformat(),
                    'level': 'success'
                })
        except Exception as e:
            # Log the error but don't fail the entire request
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Error fetching job card assignments: {str(e)}")
        
        return JsonResponse({
            'success': True,
            'notifications': notifications,
            'count': len(notifications)
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@login_required
@csrf_exempt
@require_http_methods(["POST"])
def send_notification(request):
    """Send a notification to a user"""
    try:
        data = json.loads(request.body)
        recipient_id = data.get('recipient_id')
        message = data.get('message')
        notification_type = data.get('type', 'general')
        
        if not recipient_id or not message:
            return JsonResponse({
                'success': False,
                'error': 'Recipient ID and message are required'
            }, status=400)
        
        recipient = get_object_or_404(CustomUser, id=recipient_id)
        
        # Create appropriate notification based on user type
        if recipient.user_type == '2':  # Manager
            try:
                manager = Manager.objects.get(admin=recipient)
                NotificationManager.objects.create(
                    manager=manager,
                    message=message
                )
            except Manager.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'error': 'Manager profile not found'
                }, status=404)
                
        elif recipient.user_type == '3':  # Employee
            try:
                employee = Employee.objects.get(admin=recipient)
                NotificationEmployee.objects.create(
                    employee=employee,
                    message=message
                )
            except Employee.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'error': 'Employee profile not found'
                }, status=404)
        
        return JsonResponse({
            'success': True,
            'message': 'Notification sent successfully'
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@login_required
@csrf_exempt
@require_http_methods(["POST"])
def assign_job_card(request):
    """Assign a job card to an employee with enhanced features"""
    try:
        data = json.loads(request.body)
        job_card_id = data.get('job_card_id')
        employee_id = data.get('employee_id')
        priority = data.get('priority', 'MEDIUM')
        due_date = data.get('due_date')
        notes = data.get('notes', '')
        notify_employee = data.get('notify_employee', True)
        
        if not job_card_id or not employee_id:
            return JsonResponse({
                'success': False,
                'error': 'Job card ID and employee ID are required'
            }, status=400)
        
        # Get job card and employee
        job_card = get_object_or_404(JobCard, id=job_card_id)
        employee_user = get_object_or_404(CustomUser, id=employee_id)
        employee = get_object_or_404(Employee, admin=employee_user)
        
        # Check permissions
        if request.user.user_type not in ['1', '2']:
            return JsonResponse({
                'success': False,
                'error': 'You do not have permission to assign job cards'
            }, status=403)
        
        # Update job card
        job_card.assigned_to = employee_user
        job_card.assigned_by = request.user
        job_card.priority = priority
        job_card.status = 'ASSIGNED'
        
        if due_date:
            from datetime import datetime
            job_card.due_date = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
        
        if notes:
            job_card.description += f"\n\nAssignment Notes: {notes}"
        
        job_card.save()
        
        # Send notification to employee if requested
        if notify_employee:
            NotificationEmployee.objects.create(
                employee=employee,
                message=f'You have been assigned Job Card #{job_card.job_card_number}. Priority: {priority}'
            )
        
        return JsonResponse({
            'success': True,
            'message': 'Job card assigned successfully',
            'job_card': {
                'id': job_card.id,
                'number': job_card.job_card_number,
                'type': job_card.type,
                'priority': job_card.priority,
                'status': job_card.status
            },
            'assigned_to_name': employee_user.get_full_name()
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@login_required
@require_http_methods(["GET"])
def job_card_details(request, job_card_id):
    """Get detailed information about a job card"""
    try:
        job_card = get_object_or_404(JobCard, id=job_card_id)
        
        # Check permissions
        if request.user.user_type == '3':  # Employee
            if job_card.assigned_to != request.user:
                return JsonResponse({
                    'success': False,
                    'error': 'You can only view job cards assigned to you'
                }, status=403)
        
        return JsonResponse({
            'success': True,
            'id': job_card.id,
            'number': job_card.job_card_number,
            'type': job_card.type,
            'description': job_card.description,
            'priority': job_card.priority,
            'status': job_card.status,
            'customer_name': job_card.customer.name if job_card.customer else None,
            'assigned_to': job_card.assigned_to.get_full_name() if job_card.assigned_to else None,
            'assigned_by': job_card.assigned_by.get_full_name() if job_card.assigned_by else None,
            'due_date': job_card.due_date.isoformat() if job_card.due_date else None,
            'created_at': job_card.created_at.isoformat(),
            'updated_at': job_card.updated_at.isoformat()
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@login_required
@require_http_methods(["GET"])
def employee_details(request, employee_id):
    """Get detailed information about an employee for assignment purposes"""
    try:
        employee_user = get_object_or_404(CustomUser, id=employee_id)
        employee = get_object_or_404(Employee, admin=employee_user)
        
        # Check permissions
        if request.user.user_type not in ['1', '2']:
            return JsonResponse({
                'success': False,
                'error': 'You do not have permission to view employee details'
            }, status=403)
        
        # Count active job cards
        active_jobs = JobCard.objects.filter(
            assigned_to=employee_user,
            status__in=['PENDING', 'IN_PROGRESS', 'ASSIGNED']
        ).count()
        
        # Check availability (simple logic - can be enhanced)
        is_available = active_jobs < 5  # Assume max 5 concurrent jobs
        
        return JsonResponse({
            'success': True,
            'id': employee_user.id,
            'name': employee_user.get_full_name(),
            'email': employee_user.email,
            'department': employee.division.name if employee.division else None,
            'active_jobs': active_jobs,
            'is_available': is_available,
            'is_online': employee_user.is_online,
            'last_seen': employee_user.last_seen.isoformat() if employee_user.last_seen else None
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@login_required
@csrf_exempt
@require_http_methods(["PATCH"])
def update_job_card_status(request, job_card_id):
    """Update job card status"""
    try:
        data = json.loads(request.body)
        new_status = data.get('status')
        
        if not new_status:
            return JsonResponse({
                'success': False,
                'error': 'Status is required'
            }, status=400)
        
        job_card = get_object_or_404(JobCard, id=job_card_id)
        
        # Check permissions
        if request.user.user_type == '3':  # Employee
            if job_card.assigned_to != request.user:
                return JsonResponse({
                    'success': False,
                    'error': 'You can only update job cards assigned to you'
                }, status=403)
        elif request.user.user_type == '2':  # Manager
            # Managers can update job cards in their division
            try:
                manager = Manager.objects.get(admin=request.user)
                if job_card.assigned_to and hasattr(job_card.assigned_to, 'employee'):
                    employee = job_card.assigned_to.employee
                    if employee.division != manager.division:
                        return JsonResponse({
                            'success': False,
                            'error': 'You can only update job cards in your division'
                        }, status=403)
            except Manager.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'error': 'Manager profile not found'
                }, status=404)
        
        old_status = job_card.status
        job_card.status = new_status
        job_card.save()
        
        # Send notification about status change
        if job_card.assigned_by and job_card.assigned_by != request.user:
            if job_card.assigned_by.user_type == '2':  # Manager
                try:
                    manager = Manager.objects.get(admin=job_card.assigned_by)
                    NotificationManager.objects.create(
                        manager=manager,
                        message=f'Job Card #{job_card.job_card_number} status changed from {old_status} to {new_status}'
                    )
                except Manager.DoesNotExist:
                    pass
        
        return JsonResponse({
            'success': True,
            'message': f'Job card status updated to {new_status}',
            'old_status': old_status,
            'new_status': new_status
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@login_required
@require_http_methods(["GET"])
def job_card_updates(request):
    """Get recent job card updates for real-time notifications"""
    try:
        # Get updates from the last 5 minutes
        recent_time = timezone.now() - timezone.timedelta(minutes=5)
        
        updates = []
        
        # Get job cards that were recently updated
        if request.user.user_type == '1':  # Admin - see all updates
            recent_job_cards = JobCard.objects.filter(
                updated_at__gte=recent_time
            ).select_related('assigned_to', 'assigned_by')
        elif request.user.user_type == '2':  # Manager - see division updates
            try:
                manager = Manager.objects.get(admin=request.user)
                recent_job_cards = JobCard.objects.filter(
                    updated_at__gte=recent_time,
                    assigned_to__employee__division=manager.division
                ).select_related('assigned_to', 'assigned_by')
            except Manager.DoesNotExist:
                recent_job_cards = JobCard.objects.none()
        else:  # Employee - see own updates
            recent_job_cards = JobCard.objects.filter(
                updated_at__gte=recent_time,
                assigned_to=request.user
            ).select_related('assigned_to', 'assigned_by')
        
        for job_card in recent_job_cards:
            updates.append({
                'type': 'status_change',
                'job_card_id': job_card.id,
                'job_card_number': job_card.job_card_number,
                'new_status': job_card.status,
                'updated_at': job_card.updated_at.isoformat()
            })
        
        return JsonResponse({
            'success': True,
            'updates': updates,
            'count': len(updates)
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@login_required
@require_http_methods(["POST"])
def mark_notification_read(request):
    """Mark a notification as read"""
    try:
        data = json.loads(request.body)
        notification_id = data.get('notification_id')
        notification_type = data.get('type', 'general')  # general, manager, employee
        
        if not notification_id:
            return JsonResponse({
                'success': False,
                'error': 'Notification ID is required'
            }, status=400)
        
        # Mark notification as read based on user type
        if request.user.user_type == '2':  # Manager
            try:
                manager = Manager.objects.get(admin=request.user)
                notification = NotificationManager.objects.get(
                    id=notification_id,
                    manager=manager
                )
                notification.is_read = True
                notification.read_at = timezone.now()
                notification.save()
            except (Manager.DoesNotExist, NotificationManager.DoesNotExist):
                return JsonResponse({
                    'success': False,
                    'error': 'Notification not found'
                }, status=404)
                
        elif request.user.user_type == '3':  # Employee
            try:
                employee = Employee.objects.get(admin=request.user)
                notification = NotificationEmployee.objects.get(
                    id=notification_id,
                    employee=employee
                )
                notification.is_read = True
                notification.read_at = timezone.now()
                notification.save()
            except (Employee.DoesNotExist, NotificationEmployee.DoesNotExist):
                return JsonResponse({
                    'success': False,
                    'error': 'Notification not found'
                }, status=404)
        else:
            return JsonResponse({
                'success': False,
                'error': 'Invalid user type'
            }, status=400)
        
        return JsonResponse({
            'success': True,
            'message': 'Notification marked as read'
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
