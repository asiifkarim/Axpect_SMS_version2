import logging
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.urls import reverse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from main_app.models import GoogleDriveIntegration, GoogleDriveFile, ChatMessage, ChatGroup
from .google_drive import GoogleDriveService
from .signals import log_social_activity

logger = logging.getLogger(__name__)


@login_required
def google_drive_auth(request):
    """Initiate Google Drive OAuth flow"""
    try:
        drive_service = GoogleDriveService()
        auth_url, state = drive_service.get_authorization_url(request.user, request)
        
        if auth_url:
            return redirect(auth_url)
        else:
            messages.error(request, "Failed to initiate Google Drive authentication.")
            return redirect('social:google_drive_dashboard')
            
    except Exception as e:
        logger.error(f"Error initiating Google Drive auth: {str(e)}")
        messages.error(request, "An error occurred during authentication setup.")
        return redirect('social:google_drive_dashboard')


@login_required
def google_drive_callback(request):
    """Handle Google Drive OAuth callback"""
    try:
        drive_service = GoogleDriveService()
        integration = drive_service.handle_oauth_callback(request, request.user)
        
        if integration:
            messages.success(request, f"Successfully connected to Google Drive account: {integration.google_email}")
        else:
            messages.error(request, "Failed to connect to Google Drive. Please try again.")
            
    except Exception as e:
        logger.error(f"Error handling Google Drive callback: {str(e)}")
        messages.error(request, "An error occurred during authentication.")
    
    return redirect('social:google_drive_dashboard')


@login_required
@require_POST
def google_drive_disconnect(request):
    """Disconnect Google Drive integration"""
    try:
        integration = get_object_or_404(GoogleDriveIntegration, user=request.user)
        drive_service = GoogleDriveService()
        
        if drive_service.disconnect_integration(integration):
            messages.success(request, "Google Drive account disconnected successfully.")
        else:
            messages.error(request, "Failed to disconnect Google Drive account.")
            
    except GoogleDriveIntegration.DoesNotExist:
        messages.error(request, "No Google Drive account connected.")
    except Exception as e:
        logger.error(f"Error disconnecting Google Drive: {str(e)}")
        messages.error(request, "An error occurred while disconnecting.")
    
    return redirect('social:google_drive_dashboard')


@login_required
def drive_file_browser(request):
    """Browse Google Drive files"""
    try:
        integration = get_object_or_404(GoogleDriveIntegration, user=request.user, is_active=True)
        
        if integration.is_token_expired:
            messages.error(request, "Google Drive token has expired. Please reconnect your account.")
            return redirect('social:google_drive_dashboard')
        
        drive_service = GoogleDriveService()
        folder_id = request.GET.get('folder', 'root')
        page_token = request.GET.get('page_token')
        
        result = drive_service.list_files(integration, folder_id, page_token=page_token)
        
        if result is None:
            messages.error(request, "Failed to load Google Drive files.")
            return redirect('social:google_drive_dashboard')
        
        # Separate folders and files
        folders = [f for f in result['files'] if f['mimeType'] == 'application/vnd.google-apps.folder']
        files = [f for f in result['files'] if f['mimeType'] != 'application/vnd.google-apps.folder']
        
        context = {
            'page_title': 'Google Drive Files',
            'integration': integration,
            'folders': folders,
            'files': files,
            'current_folder': folder_id,
            'next_page_token': result.get('next_page_token'),
            'can_share_files': True
        }
        
        return render(request, 'social/drive_file_browser.html', context)
        
    except GoogleDriveIntegration.DoesNotExist:
        messages.error(request, "Google Drive not connected. Please connect your account first.")
        return redirect('social:google_drive_dashboard')
    except Exception as e:
        logger.error(f"Error browsing Drive files: {str(e)}")
        messages.error(request, "An error occurred while loading files.")
        return redirect('social:google_drive_dashboard')


@login_required
@require_POST
def share_drive_file(request, file_id):
    """Share a Google Drive file in chat"""
    try:
        integration = get_object_or_404(GoogleDriveIntegration, user=request.user, is_active=True)
        group_id = request.POST.get('group_id')
        
        if not group_id:
            return JsonResponse({'error': 'Group ID is required'}, status=400)
        
        # Validate group access
        group = get_object_or_404(ChatGroup, id=group_id, is_active=True)
        if not group.members.filter(user=request.user, is_active=True).exists():
            return JsonResponse({'error': 'Access denied'}, status=403)
        
        drive_service = GoogleDriveService()
        
        # Validate file
        is_valid, message = drive_service.validate_file_for_sharing(integration, file_id)
        if not is_valid:
            return JsonResponse({'error': message}, status=400)
        
        # Get file info
        file_info = drive_service.get_file_info(integration, file_id)
        if not file_info:
            return JsonResponse({'error': 'File not found'}, status=404)
        
        # Create shareable link
        share_url = drive_service.create_shareable_link(integration, file_id)
        if not share_url:
            share_url = file_info.get('webViewLink', '')
        
        # Create chat message with Drive file
        message = ChatMessage.objects.create(
            group=group,
            sender=request.user,
            content=f"Shared file: {file_info['name']}",
            message_type='DRIVE_FILE',
            drive_file_id=file_id,
            drive_file_name=file_info['name'],
            drive_file_url=share_url
        )
        
        # Log activity
        log_social_activity(
            user=request.user,
            action='FILE_SHARED',
            group=group,
            message=message,
            details={
                'file_id': file_id,
                'file_name': file_info['name'],
                'file_size': file_info.get('size')
            },
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT')
        )
        
        return JsonResponse({
            'success': True,
            'message_id': message.id,
            'redirect_url': reverse('social:chat_room', args=[group_id])
        })
        
    except Exception as e:
        logger.error(f"Error sharing Drive file: {str(e)}")
        return JsonResponse({'error': 'Failed to share file'}, status=500)


# API Endpoints

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_drive_files(request):
    """API endpoint to get Google Drive files"""
    try:
        integration = GoogleDriveIntegration.objects.get(user=request.user, is_active=True)
        
        if integration.is_token_expired:
            return Response(
                {'error': 'Token expired. Please reconnect your Google Drive account.'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        drive_service = GoogleDriveService()
        folder_id = request.GET.get('folder', 'root')
        page_token = request.GET.get('page_token')
        
        result = drive_service.list_files(integration, folder_id, page_token=page_token)
        
        if result is None:
            return Response(
                {'error': 'Failed to load files from Google Drive'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Format files for API response
        files_data = []
        for file_data in result['files']:
            files_data.append({
                'id': file_data['id'],
                'name': file_data['name'],
                'mimeType': file_data['mimeType'],
                'size': file_data.get('size'),
                'webViewLink': file_data.get('webViewLink'),
                'thumbnailLink': file_data.get('thumbnailLink'),
                'isFolder': file_data['mimeType'] == 'application/vnd.google-apps.folder',
                'canShare': file_data['mimeType'] in integration.allowed_file_types
            })
        
        return Response({
            'files': files_data,
            'nextPageToken': result.get('next_page_token'),
            'currentFolder': folder_id
        })
        
    except GoogleDriveIntegration.DoesNotExist:
        return Response(
            {'error': 'Google Drive not connected'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"API error loading Drive files: {str(e)}")
        return Response(
            {'error': 'Internal server error'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_drive_file_info(request, file_id):
    """API endpoint to get detailed file information"""
    try:
        integration = GoogleDriveIntegration.objects.get(user=request.user, is_active=True)
        drive_service = GoogleDriveService()
        
        file_info = drive_service.get_file_info(integration, file_id)
        
        if not file_info:
            return Response(
                {'error': 'File not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Validate file for sharing
        is_valid, validation_message = drive_service.validate_file_for_sharing(integration, file_id)
        
        return Response({
            'id': file_info['id'],
            'name': file_info['name'],
            'mimeType': file_info['mimeType'],
            'size': file_info.get('size'),
            'webViewLink': file_info.get('webViewLink'),
            'webContentLink': file_info.get('webContentLink'),
            'thumbnailLink': file_info.get('thumbnailLink'),
            'canShare': is_valid,
            'validationMessage': validation_message
        })
        
    except GoogleDriveIntegration.DoesNotExist:
        return Response(
            {'error': 'Google Drive not connected'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"API error getting file info: {str(e)}")
        return Response(
            {'error': 'Internal server error'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_attach_drive_file(request, file_id):
    """API endpoint to attach Google Drive file to a message"""
    try:
        integration = GoogleDriveIntegration.objects.get(user=request.user, is_active=True)
        group_id = request.data.get('group_id')
        message_content = request.data.get('content', '').strip()
        
        if not group_id:
            return Response(
                {'error': 'Group ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate group access
        group = get_object_or_404(ChatGroup, id=group_id, is_active=True)
        if not group.members.filter(user=request.user, is_active=True).exists():
            return Response(
                {'error': 'Access denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        drive_service = GoogleDriveService()
        
        # Validate file
        is_valid, validation_message = drive_service.validate_file_for_sharing(integration, file_id)
        if not is_valid:
            return Response(
                {'error': validation_message}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get file info
        file_info = drive_service.get_file_info(integration, file_id)
        if not file_info:
            return Response(
                {'error': 'File not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Create shareable link
        share_url = drive_service.create_shareable_link(integration, file_id)
        if not share_url:
            share_url = file_info.get('webViewLink', '')
        
        # Create message content
        if not message_content:
            message_content = f"📎 {file_info['name']}"
        
        # Create chat message
        message = ChatMessage.objects.create(
            group=group,
            sender=request.user,
            content=message_content,
            message_type='DRIVE_FILE',
            drive_file_id=file_id,
            drive_file_name=file_info['name'],
            drive_file_url=share_url
        )
        
        return Response({
            'message_id': message.id,
            'file_name': file_info['name'],
            'file_url': share_url,
            'created_at': message.created_at.isoformat()
        }, status=status.HTTP_201_CREATED)
        
    except GoogleDriveIntegration.DoesNotExist:
        return Response(
            {'error': 'Google Drive not connected'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"API error attaching Drive file: {str(e)}")
        return Response(
            {'error': 'Internal server error'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
