import json
import logging
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponseForbidden
from django.views.decorators.http import require_http_methods, require_POST
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
from django.db.models import Q, Count, Max
from django.utils import timezone
from django.contrib import messages
from django.urls import reverse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from main_app.models import (
    CustomUser, ChatGroup, ChatGroupMember, ChatMessage, 
    ChatMessageReaction, ChatMessageDelivery, Department,
    SocialNotificationSettings, GoogleDriveIntegration
)
from .utils import get_user_groups, create_direct_message_group
from .google_drive import GoogleDriveService
from .signals import log_social_activity

logger = logging.getLogger(__name__)


# ==============================================
# Main Social Views
# ==============================================

@login_required
def social_dashboard(request):
    """Main social dashboard - messaging interface"""
    user_groups = get_user_groups(request.user)
    
    # Get recent messages for each group
    groups_with_messages = []
    for group in user_groups:
        latest_message = group.messages.filter(is_deleted=False).first()
        unread_count = ChatGroupMember.objects.get(
            group=group, user=request.user
        ).unread_count
        
        groups_with_messages.append({
            'group': group,
            'latest_message': latest_message,
            'unread_count': unread_count
        })
    
    # Sort by latest message timestamp
    groups_with_messages.sort(
        key=lambda x: x['latest_message'].created_at if x['latest_message'] else timezone.now(),
        reverse=True
    )
    
    context = {
        'page_title': 'Social - Messages',
        'groups_with_messages': groups_with_messages,
        'user_departments': Department.objects.filter(
            employee__admin=request.user
        ) if hasattr(request.user, 'employee') else []
    }
    
    return render(request, 'social/dashboard.html', context)


@login_required
def chat_room(request, group_id):
    """Individual chat room view"""
    group = get_object_or_404(ChatGroup, id=group_id, is_active=True)
    
    # Check if user has access to this group
    try:
        membership = ChatGroupMember.objects.get(
            group=group, user=request.user, is_active=True
        )
    except ChatGroupMember.DoesNotExist:
        messages.error(request, "You don't have access to this chat group.")
        return redirect('social:dashboard')
    
    # Get messages with pagination
    messages_list = group.messages.filter(is_deleted=False).select_related(
        'sender', 'reply_to__sender'
    ).prefetch_related('reactions__user').order_by('created_at').order_by('created_at')
    
    paginator = Paginator(messages_list, 50)
    page_number = request.GET.get('page', 1)
    page_messages = paginator.get_page(page_number)
    
    # Mark messages as read
    ChatMessageDelivery.objects.filter(
        message__group=group,
        user=request.user,
        status__in=['SENT', 'DELIVERED']
    ).update(
        status='READ',
        read_at=timezone.now()
    )
    
    # Update last read timestamp
    membership.last_read_at = timezone.now()
    membership.save(update_fields=['last_read_at'])
    
    # Get group members
    group_members = group.members.filter(is_active=True).select_related('user')
    
    # Check Google Drive connection status
    try:
        drive_integration = request.user.drive_integration
        is_drive_connected = drive_integration.is_active and not drive_integration.is_token_expired
    except GoogleDriveIntegration.DoesNotExist:
        drive_integration = None
        is_drive_connected = False
    
    context = {
        'page_title': f'Chat - {group.name}',
        'group': group,
        'messages': page_messages,
        'group_members': group_members,
        'user_membership': membership,
        'can_manage_group': membership.role in ['ADMIN', 'MODERATOR'],
        'is_drive_connected': is_drive_connected,
        'drive_integration': drive_integration
    }
    
    return render(request, 'social/chat_room.html', context)


@login_required
def google_drive_dashboard(request):
    """Google Drive integration dashboard"""
    try:
        drive_integration = request.user.drive_integration
        # Check if connected and has valid refresh token
        is_connected = drive_integration.is_active and not drive_integration.is_token_expired
        needs_reconnection = drive_integration.is_active and (drive_integration.is_token_expired or not drive_integration.refresh_token)
    except GoogleDriveIntegration.DoesNotExist:
        drive_integration = None
        is_connected = False
        needs_reconnection = False
    
    # If connected, fetch Drive files
    files = []
    folders = []
    if is_connected:
        try:
            from .google_drive import GoogleDriveService
            drive_service = GoogleDriveService()
            result = drive_service.list_files(drive_integration, 'root', page_size=20)
            
            if result:
                # Separate folders and files
                folders = [f for f in result['files'] if f['mimeType'] == 'application/vnd.google-apps.folder']
                files = [f for f in result['files'] if f['mimeType'] != 'application/vnd.google-apps.folder']
        except Exception as e:
            logger.error(f"Error fetching Drive files: {str(e)}")
    
    context = {
        'page_title': 'Google Drive Integration',
        'drive_integration': drive_integration,
        'is_connected': is_connected,
        'needs_reconnection': needs_reconnection,
        'google_oauth_url': reverse('social:google_drive_auth') if not is_connected or needs_reconnection else None,
        'files': files,
        'folders': folders
    }
    
    return render(request, 'social/google_drive_dashboard.html', context)


# ==============================================
# API Endpoints
# ==============================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_user_groups(request):
    """Get user's chat groups"""
    groups = get_user_groups(request.user)
    
    groups_data = []
    for group in groups:
        latest_message = group.messages.filter(is_deleted=False).first()
        membership = ChatGroupMember.objects.get(group=group, user=request.user)
        
        groups_data.append({
            'id': group.id,
            'name': group.name,
            'group_type': group.group_type,
            'description': group.description,
            'member_count': group.member_count,
            'latest_message': {
                'content': latest_message.content[:100] if latest_message else None,
                'sender_name': f"{latest_message.sender.first_name} {latest_message.sender.last_name}" if latest_message else None,
                'created_at': latest_message.created_at.isoformat() if latest_message else None,
                'message_type': latest_message.message_type if latest_message else None
            } if latest_message else None,
            'unread_count': membership.unread_count,
            'is_muted': membership.is_muted,
            'last_read_at': membership.last_read_at.isoformat() if membership.last_read_at else None
        })
    
    return Response(groups_data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_chat_messages(request, group_id):
    """Get messages for a chat group"""
    group = get_object_or_404(ChatGroup, id=group_id, is_active=True)
    
    # Check access
    if not ChatGroupMember.objects.filter(
        group=group, user=request.user, is_active=True
    ).exists():
        return Response(
            {'error': 'Access denied'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get messages with pagination
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 50))
    
    messages_list = group.messages.filter(is_deleted=False).select_related(
        'sender', 'reply_to__sender'
    ).prefetch_related('reactions__user').order_by('created_at')
    
    paginator = Paginator(messages_list, page_size)
    page_messages = paginator.get_page(page)
    
    messages_data = []
    for message in page_messages:
        reactions = {}
        for reaction in message.reactions.all():
            reaction_type = reaction.reaction_type
            if reaction_type not in reactions:
                reactions[reaction_type] = []
            reactions[reaction_type].append({
                'user_id': reaction.user.id,
                'user_name': f"{reaction.user.first_name} {reaction.user.last_name}"
            })
        
        messages_data.append({
            'id': message.id,
            'content': message.content,
            'message_type': message.message_type,
            'sender': {
                'id': message.sender.id,
                'name': f"{message.sender.first_name} {message.sender.last_name}",
                'profile_pic': message.sender.profile_pic.url if message.sender.profile_pic else None
            },
            'reply_to': {
                'id': message.reply_to.id,
                'content': message.reply_to.content[:100],
                'sender_name': f"{message.reply_to.sender.first_name} {message.reply_to.sender.last_name}"
            } if message.reply_to else None,
            'reactions': reactions,
            'created_at': message.created_at.isoformat(),
            'is_edited': message.is_edited,
            'edited_at': message.edited_at.isoformat() if message.edited_at else None,
            'file_attachment': message.file_attachment.url if message.file_attachment else None,
            'file_name': message.file_name,
            'drive_file_url': message.drive_file_url
        })
    
    return Response({
        'messages': messages_data,
        'has_next': page_messages.has_next(),
        'has_previous': page_messages.has_previous(),
        'total_pages': paginator.num_pages,
        'current_page': page
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_send_message(request, group_id):
    """Send a message to a chat group"""
    group = get_object_or_404(ChatGroup, id=group_id, is_active=True)
    
    # Check access
    membership = ChatGroupMember.objects.filter(
        group=group, user=request.user, is_active=True
    ).first()
    
    if not membership:
        return Response(
            {'error': 'Access denied'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    content = request.data.get('content', '').strip()
    reply_to_id = request.data.get('reply_to')
    
    if not content:
        return Response(
            {'error': 'Message content is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Handle reply
    reply_to = None
    if reply_to_id:
        try:
            reply_to = ChatMessage.objects.get(id=reply_to_id, group=group)
        except ChatMessage.DoesNotExist:
            return Response(
                {'error': 'Reply message not found'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Create message
    message = ChatMessage.objects.create(
        group=group,
        sender=request.user,
        content=content,
        reply_to=reply_to,
        message_type='TEXT'
    )
    
    # Log activity
    log_social_activity(
        user=request.user,
        action='MESSAGE_SENT',
        group=group,
        message=message,
        ip_address=request.META.get('REMOTE_ADDR'),
        user_agent=request.META.get('HTTP_USER_AGENT')
    )
    
    return Response({
        'message_id': message.id,
        'created_at': message.created_at.isoformat()
    }, status=status.HTTP_201_CREATED)


@login_required
@csrf_exempt
@require_POST
def api_create_group(request):
    """Create a new custom chat group"""
    try:
        # Handle both JSON and form data
        if request.content_type == 'application/json':
            data = json.loads(request.body)
        else:
            data = request.POST
            
        name = data.get('name', '').strip()
        description = data.get('description', '').strip()
        member_ids = data.get('member_ids', [])
        
        if not name:
            return JsonResponse(
                {'error': 'Group name is required'}, 
                status=400
            )
        
        # Create group
        group = ChatGroup.objects.create(
            name=name,
            group_type='CUSTOM',
            description=description,
            created_by=request.user,
            is_active=True,
            allow_file_sharing=True
        )
        
        # Add creator as admin
        ChatGroupMember.objects.create(
            group=group,
            user=request.user,
            role='ADMIN',
            is_active=True
        )
        
        # Add other members
        for member_id in member_ids:
            try:
                member_id = int(member_id)  # Convert to int
                user = CustomUser.objects.get(id=member_id)
                ChatGroupMember.objects.create(
                    group=group,
                    user=user,
                    role='MEMBER',
                    is_active=True
                )
            except (ValueError, TypeError, CustomUser.DoesNotExist):
                continue
        
        return JsonResponse({
            'group_id': group.id,
            'name': group.name,
            'member_count': group.members.filter(is_active=True).count(),
            'redirect_url': reverse('social:chat_room', args=[group.id])
        })
        
    except json.JSONDecodeError:
        return JsonResponse(
            {'error': 'Invalid JSON data'}, 
            status=400
        )
    except Exception as e:
        logger.error(f"Error creating group: {str(e)}")
        return JsonResponse(
            {'error': 'Failed to create group'}, 
            status=500
        )


@login_required
def api_search_users(request):
    """Search for users to add to groups or start DMs"""
    query = request.GET.get('q', '').strip()
    
    if len(query) < 2:
        return JsonResponse({'users': []})
    
    # Search users by name or email
    users = CustomUser.objects.filter(
        Q(first_name__icontains=query) |
        Q(last_name__icontains=query) |
        Q(email__icontains=query)
    ).exclude(id=request.user.id)[:20]
    
    users_data = []
    for user in users:
        users_data.append({
            'id': user.id,
            'name': f"{user.first_name} {user.last_name}",
            'email': user.email,
            'profile_pic': user.profile_pic.url if user.profile_pic else None,
            'user_type': user.get_user_type_display(),
            'is_online': user.is_online
        })
    
    return JsonResponse({'users': users_data})


@login_required
@csrf_exempt
@require_POST
def api_start_direct_message(request):
    """Start a direct message with another user"""
    try:
        # Debug logging
        logger.info(f"DM Start Request - Content-Type: {request.content_type}")
        logger.info(f"DM Start Request - POST data: {dict(request.POST)}")
        logger.info(f"DM Start Request - Body: {request.body}")
        
        # Handle both JSON and form data
        if request.content_type == 'application/json':
            data = json.loads(request.body)
        else:
            data = request.POST
        
        target_user_id = data.get('user_id')
        
        logger.info(f"DM Start - Extracted user_id: {target_user_id}")
        
        if not target_user_id:
            logger.warning("DM Start - No user_id provided")
            return JsonResponse(
                {'error': 'User ID is required'}, 
                status=400
            )
        
        # Convert to int if it's a string
        try:
            target_user_id = int(target_user_id)
            logger.info(f"DM Start - Converted user_id to int: {target_user_id}")
        except (ValueError, TypeError) as e:
            logger.error(f"DM Start - Invalid user_id format: {target_user_id}, error: {str(e)}")
            return JsonResponse(
                {'error': 'Invalid user ID format'}, 
                status=400
            )
        
        try:
            target_user = CustomUser.objects.get(id=target_user_id)
            logger.info(f"DM Start - Found target user: {target_user.email}")
        except CustomUser.DoesNotExist:
            logger.error(f"DM Start - User not found with ID: {target_user_id}")
            return JsonResponse(
                {'error': 'User not found'}, 
                status=404
            )
        
        # Create or get existing DM group
        group = create_direct_message_group(request.user, target_user)
        logger.info(f"DM Start - Created/found group: {group.id}")
        
        return JsonResponse({
            'group_id': group.id,
            'group_name': group.name,
            'redirect_url': reverse('social:chat_room', args=[group.id])
        })
        
    except json.JSONDecodeError as e:
        logger.error(f"DM Start - JSON decode error: {str(e)}")
        return JsonResponse(
            {'error': 'Invalid JSON data'}, 
            status=400
        )
    except Exception as e:
        logger.error(f"Error starting direct message: {str(e)}")
        return JsonResponse(
            {'error': 'Failed to start conversation'}, 
            status=500
        )


# ==============================================
# Group Management Views
# ==============================================

@login_required
@require_POST
def leave_group(request, group_id):
    """Leave a chat group"""
    group = get_object_or_404(ChatGroup, id=group_id, is_active=True)
    
    try:
        membership = ChatGroupMember.objects.get(
            group=group, user=request.user, is_active=True
        )
        
        # Don't allow leaving department groups
        if group.group_type == 'DEPARTMENT':
            messages.error(request, "You cannot leave department groups.")
            return redirect('social:chat_room', group_id=group_id)
        
        # Deactivate membership
        membership.is_active = False
        membership.save()
        
        messages.success(request, f"You have left the group '{group.name}'.")
        
        # Log activity
        log_social_activity(
            user=request.user,
            action='GROUP_LEFT',
            group=group,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT')
        )
        
    except ChatGroupMember.DoesNotExist:
        messages.error(request, "You are not a member of this group.")
    
    return redirect('social:dashboard')


@login_required
def notification_settings(request):
    """Social notification settings page"""
    settings_obj, created = SocialNotificationSettings.objects.get_or_create(
        user=request.user
    )
    
    if request.method == 'POST':
        # Update settings
        settings_obj.desktop_notifications = request.POST.get('desktop_notifications') == 'on'
        settings_obj.email_notifications = request.POST.get('email_notifications') == 'on'
        settings_obj.sound_notifications = request.POST.get('sound_notifications') == 'on'
        settings_obj.weekend_notifications = request.POST.get('weekend_notifications') == 'on'
        settings_obj.mute_all_groups = request.POST.get('mute_all_groups') == 'on'
        settings_obj.only_mentions = request.POST.get('only_mentions') == 'on'
        settings_obj.drive_share_notifications = request.POST.get('drive_share_notifications') == 'on'
        settings_obj.drive_sync_notifications = request.POST.get('drive_sync_notifications') == 'on'
        
        # Handle quiet hours
        quiet_start = request.POST.get('quiet_hours_start')
        quiet_end = request.POST.get('quiet_hours_end')
        
        if quiet_start:
            settings_obj.quiet_hours_start = quiet_start
        if quiet_end:
            settings_obj.quiet_hours_end = quiet_end
        
        settings_obj.save()
        messages.success(request, "Notification settings updated successfully.")
        return redirect('social:notification_settings')
    
    context = {
        'page_title': 'Notification Settings',
        'settings': settings_obj
    }
    
    return render(request, 'social/notification_settings.html', context)
