import os
import json
import logging
from datetime import datetime, timedelta
from django.conf import settings
from django.utils import timezone
from django.urls import reverse
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from cryptography.fernet import Fernet
from main_app.models import GoogleDriveIntegration, GoogleDriveFile

logger = logging.getLogger(__name__)

# Google Drive API scopes - principle of least privilege
SCOPES = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'openid'  # Added to match Google's response
]

# File size limits (in bytes)
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB default

# Allowed MIME types for security
ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    'text/plain',
    'text/csv',
    'application/zip',
    'application/x-rar-compressed'
]


class GoogleDriveService:
    """Service class for Google Drive integration"""
    
    def __init__(self):
        self.encryption_key = self._get_encryption_key()
        self.fernet = Fernet(self.encryption_key)
    
    def _get_encryption_key(self):
        """Get or create encryption key for tokens"""
        key_file = os.path.join(settings.BASE_DIR, '.drive_key')
        
        if os.path.exists(key_file):
            with open(key_file, 'rb') as f:
                return f.read()
        else:
            key = Fernet.generate_key()
            with open(key_file, 'wb') as f:
                f.write(key)
            return key
    
    def _encrypt_token(self, token):
        """Encrypt token for storage"""
        return self.fernet.encrypt(token.encode()).decode()
    
    def _decrypt_token(self, encrypted_token):
        """Decrypt token from storage"""
        return self.fernet.decrypt(encrypted_token.encode()).decode()
    
    def get_authorization_url(self, user, request):
        """Get Google OAuth authorization URL"""
        try:
            # Use the exact redirect URI from Google Cloud Console configuration
            # Ensure we use the correct host and port
            if request and hasattr(request, 'META'):
                host = request.META.get('HTTP_HOST', '127.0.0.1:8000')
                # Clean up any duplicate host information
                if '127.0.0.1' in host and '8000' in host:
                    redirect_uri = "http://127.0.0.1:8000/social/drive/callback/"
                else:
                    redirect_uri = f"http://{host}/social/drive/callback/"
            else:
                redirect_uri = "http://127.0.0.1:8000/social/drive/callback/"
            
            # Create the OAuth flow with exact client configuration
            flow = Flow.from_client_config(
                {
                    "web": {
                        "client_id": settings.GOOGLE_OAUTH_CLIENT_ID,
                        "client_secret": settings.GOOGLE_OAUTH_CLIENT_SECRET,
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token",
                        "redirect_uris": [
                            "http://127.0.0.1:8000/social/drive/callback/",
                            "http://localhost:8000/social/drive/callback/"
                        ]
                    }
                },
                scopes=SCOPES,
                redirect_uri=redirect_uri
            )
            
            authorization_url, state = flow.authorization_url(
                access_type='offline',
                include_granted_scopes='true',
                state=str(user.id),  # Include user ID in state for security
                prompt='consent'  # Force consent screen to get refresh token
            )
            
            logger.info(f"Generated OAuth URL for user {user.id}: {authorization_url}")
            logger.info(f"Redirect URI used: {redirect_uri}")
            logger.info(f"Client ID: {settings.GOOGLE_OAUTH_CLIENT_ID}")
            return authorization_url, state
            
        except Exception as e:
            logger.error(f"Error generating authorization URL: {str(e)}")
            return None, None
    
    def handle_oauth_callback(self, request, user):
        """Handle OAuth callback and store tokens"""
        try:
            code = request.GET.get('code')
            state = request.GET.get('state')
            error = request.GET.get('error')
            
            if error:
                logger.error(f"OAuth error: {error}")
                return None
            
            if not code or str(user.id) != state:
                logger.error(f"Invalid OAuth callback parameters. Code: {bool(code)}, State: {state}, User ID: {user.id}")
                raise ValueError("Invalid OAuth callback parameters")
            
            # Use the exact redirect URI from Google Cloud Console configuration
            redirect_uri = "http://127.0.0.1:8000/social/drive/callback/"
            
            flow = Flow.from_client_config(
                {
                    "web": {
                        "client_id": settings.GOOGLE_OAUTH_CLIENT_ID,
                        "client_secret": settings.GOOGLE_OAUTH_CLIENT_SECRET,
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token",
                        "redirect_uris": [
                            "http://127.0.0.1:8000/social/drive/callback/",
                            "http://localhost:8000/social/drive/callback/"
                        ]
                    }
                },
                scopes=SCOPES,
                state=state,
                redirect_uri=redirect_uri
            )
            
            flow.fetch_token(code=code)
            
            credentials = flow.credentials
            
            # Get user info
            user_info = self._get_user_info(credentials)
            
            # Store or update integration
            integration, created = GoogleDriveIntegration.objects.update_or_create(
                user=user,
                defaults={
                    'access_token': self._encrypt_token(credentials.token),
                    'refresh_token': self._encrypt_token(credentials.refresh_token) if credentials.refresh_token else '',
                    'token_expires_at': credentials.expiry if credentials.expiry else timezone.now() + timedelta(hours=1),
                    'google_email': user_info.get('email', ''),
                    'google_name': user_info.get('name', ''),
                    'google_id': user_info.get('id', ''),
                    'is_active': True,
                    'allowed_file_types': ALLOWED_MIME_TYPES,
                    'max_file_size_mb': 100,
                    'sync_error_count': 0,
                    'last_error': ''
                }
            )
            
            # Log the connection
            from .signals import log_social_activity
            log_social_activity(
                user=user,
                action='DRIVE_CONNECTED',
                details={
                    'google_email': user_info.get('email'),
                    'created': created
                },
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT')
            )
            
            logger.info(f"Successfully connected Google Drive for user {user.id}: {user_info.get('email')}")
            return integration
            
        except Exception as e:
            logger.error(f"Error handling OAuth callback: {str(e)}")
            return None
    
    def _get_user_info(self, credentials):
        """Get user info from Google"""
        try:
            service = build('oauth2', 'v2', credentials=credentials)
            user_info = service.userinfo().get().execute()
            return user_info
        except Exception as e:
            logger.error(f"Error getting user info: {str(e)}")
            return {}
    
    def get_credentials(self, integration):
        """Get valid credentials for an integration"""
        try:
            credentials = Credentials(
                token=self._decrypt_token(integration.access_token),
                refresh_token=self._decrypt_token(integration.refresh_token) if integration.refresh_token else None,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=settings.GOOGLE_OAUTH_CLIENT_ID,
                client_secret=settings.GOOGLE_OAUTH_CLIENT_SECRET,
                scopes=SCOPES
            )
            
            # Check if token is expired or will expire soon (within 5 minutes)
            if integration.is_token_expired or credentials.expired:
                if credentials.refresh_token:
                    try:
                        credentials.refresh(Request())
                        
                        # Update stored tokens
                        integration.access_token = self._encrypt_token(credentials.token)
                        if credentials.refresh_token:
                            integration.refresh_token = self._encrypt_token(credentials.refresh_token)
                        integration.token_expires_at = credentials.expiry if credentials.expiry else timezone.now() + timedelta(seconds=3600)
                        integration.sync_error_count = 0  # Reset error count on successful refresh
                        integration.last_error = ''
                        integration.save(update_fields=['access_token', 'refresh_token', 'token_expires_at', 'sync_error_count', 'last_error'])
                        
                        logger.info(f"Successfully refreshed token for user {integration.user.email}")
                    except Exception as refresh_error:
                        logger.error(f"Failed to refresh token for user {integration.user.email}: {str(refresh_error)}")
                        integration.sync_error_count += 1
                        integration.last_error = f"Token refresh failed: {str(refresh_error)}"
                        integration.save(update_fields=['sync_error_count', 'last_error'])
                        return None
                else:
                    logger.error(f"No refresh token available for user {integration.user.email}")
                    integration.sync_error_count += 1
                    integration.last_error = "No refresh token available"
                    integration.save(update_fields=['sync_error_count', 'last_error'])
                    return None
            
            return credentials
            
        except Exception as e:
            logger.error(f"Error getting credentials: {str(e)}")
            integration.sync_error_count += 1
            integration.last_error = str(e)
            integration.save(update_fields=['sync_error_count', 'last_error'])
            return None
    
    def list_files(self, integration, folder_id='root', page_size=50, page_token=None):
        """List files from Google Drive"""
        try:
            credentials = self.get_credentials(integration)
            if not credentials:
                return None
            
            service = build('drive', 'v3', credentials=credentials)
            
            query = f"'{folder_id}' in parents and trashed=false"
            
            results = service.files().list(
                q=query,
                pageSize=page_size,
                pageToken=page_token,
                fields="nextPageToken, files(id, name, mimeType, size, webViewLink, webContentLink, thumbnailLink, parents, createdTime, modifiedTime)"
            ).execute()
            
            files = results.get('files', [])
            next_page_token = results.get('nextPageToken')
            
            # Cache files
            self._cache_files(integration, files)
            
            return {
                'files': files,
                'next_page_token': next_page_token
            }
            
        except HttpError as e:
            logger.error(f"Google Drive API error: {str(e)}")
            integration.sync_error_count += 1
            integration.last_error = f"API Error: {str(e)}"
            integration.save(update_fields=['sync_error_count', 'last_error'])
            return None
        except Exception as e:
            logger.error(f"Error listing files: {str(e)}")
            integration.sync_error_count += 1
            integration.last_error = str(e)
            integration.save(update_fields=['sync_error_count', 'last_error'])
            return None
    
    def _cache_files(self, integration, files):
        """Cache file metadata in database"""
        try:
            for file_data in files:
                GoogleDriveFile.objects.update_or_create(
                    integration=integration,
                    drive_file_id=file_data['id'],
                    defaults={
                        'name': file_data.get('name', ''),
                        'mime_type': file_data.get('mimeType', ''),
                        'size': int(file_data.get('size', 0)) if file_data.get('size') else None,
                        'web_view_link': file_data.get('webViewLink', ''),
                        'web_content_link': file_data.get('webContentLink', ''),
                        'thumbnail_link': file_data.get('thumbnailLink', ''),
                        'is_public': False,  # Default to private
                        'can_share': True
                    }
                )
        except Exception as e:
            logger.error(f"Error caching files: {str(e)}")
    
    def get_file_info(self, integration, file_id):
        """Get detailed file information"""
        try:
            credentials = self.get_credentials(integration)
            if not credentials:
                return None
            
            service = build('drive', 'v3', credentials=credentials)
            
            file_info = service.files().get(
                fileId=file_id,
                fields="id, name, mimeType, size, webViewLink, webContentLink, thumbnailLink, permissions"
            ).execute()
            
            return file_info
            
        except Exception as e:
            logger.error(f"Error getting file info: {str(e)}")
            return None
    
    def create_shareable_link(self, integration, file_id):
        """Create a shareable link for a file"""
        try:
            credentials = self.get_credentials(integration)
            if not credentials:
                return None
            
            service = build('drive', 'v3', credentials=credentials)
            
            # Make file readable by anyone with the link
            permission = {
                'role': 'reader',
                'type': 'anyone'
            }
            
            service.permissions().create(
                fileId=file_id,
                body=permission
            ).execute()
            
            # Get the updated file info
            file_info = service.files().get(
                fileId=file_id,
                fields="webViewLink, webContentLink"
            ).execute()
            
            return file_info.get('webViewLink')
            
        except Exception as e:
            logger.error(f"Error creating shareable link: {str(e)}")
            return None
    
    def disconnect_integration(self, integration):
        """Disconnect Google Drive integration"""
        try:
            # Revoke tokens
            credentials = self.get_credentials(integration)
            if credentials:
                credentials.revoke(Request())
            
            # Log disconnection
            from .signals import log_social_activity
            log_social_activity(
                user=integration.user,
                action='DRIVE_DISCONNECTED',
                details={'google_email': integration.google_email}
            )
            
            # Delete integration and cached files
            integration.cached_files.all().delete()
            integration.delete()
            
            return True
            
        except Exception as e:
            logger.error(f"Error disconnecting integration: {str(e)}")
            return False
    
    def validate_file_for_sharing(self, integration, file_id):
        """Validate if file can be shared based on security policies"""
        try:
            file_info = self.get_file_info(integration, file_id)
            if not file_info:
                return False, "File not found"
            
            # Check file size
            file_size = int(file_info.get('size', 0))
            max_size = integration.max_file_size_mb * 1024 * 1024
            
            if file_size > max_size:
                return False, f"File size exceeds limit ({integration.max_file_size_mb}MB)"
            
            # Check MIME type
            mime_type = file_info.get('mimeType', '')
            if mime_type not in integration.allowed_file_types:
                return False, f"File type not allowed: {mime_type}"
            
            return True, "File is valid for sharing"
            
        except Exception as e:
            logger.error(f"Error validating file: {str(e)}")
            return False, str(e)
