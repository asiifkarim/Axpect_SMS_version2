from django.urls import path
from . import views, google_drive_views

app_name = 'social'

urlpatterns = [
    # Main social views
    path('', views.social_dashboard, name='dashboard'),
    path('chat/<int:group_id>/', views.chat_room, name='chat_room'),
    path('notifications/settings/', views.notification_settings, name='notification_settings'),
    
    # Group management
    path('group/<int:group_id>/leave/', views.leave_group, name='leave_group'),
    
    # Google Drive integration
    path('drive/', views.google_drive_dashboard, name='google_drive_dashboard'),
    path('drive/auth/', google_drive_views.google_drive_auth, name='google_drive_auth'),
    path('drive/callback/', google_drive_views.google_drive_callback, name='google_drive_callback'),
    path('drive/disconnect/', google_drive_views.google_drive_disconnect, name='google_drive_disconnect'),
    path('drive/files/', google_drive_views.drive_file_browser, name='drive_file_browser'),
    path('drive/files/<str:file_id>/share/', google_drive_views.share_drive_file, name='share_drive_file'),
    
    # API endpoints
    path('api/groups/', views.api_user_groups, name='api_user_groups'),
    path('api/groups/<int:group_id>/messages/', views.api_chat_messages, name='api_chat_messages'),
    path('api/groups/<int:group_id>/send/', views.api_send_message, name='api_send_message'),
    path('api/groups/create/', views.api_create_group, name='api_create_group'),
    path('api/users/search/', views.api_search_users, name='api_search_users'),
    path('api/dm/start/', views.api_start_direct_message, name='api_start_direct_message'),
    
    # Google Drive API endpoints
    path('api/drive/files/', google_drive_views.api_drive_files, name='api_drive_files'),
    path('api/drive/files/<str:file_id>/', google_drive_views.api_drive_file_info, name='api_drive_file_info'),
    path('api/drive/files/<str:file_id>/attach/', google_drive_views.api_attach_drive_file, name='api_attach_drive_file'),
]
