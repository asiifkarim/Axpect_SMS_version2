from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from . import views
from . import notification_views

router = DefaultRouter()
router.register(r'jobcards', views.JobCardViewSet, basename='jobcard')
router.register(r'customers', views.CustomerViewSet, basename='customer')
router.register(r'orders', views.OrderViewSet, basename='order')
router.register(r'payments', views.PaymentViewSet, basename='payment')

urlpatterns = [
    # Authentication
    path('auth/login/', views.login_api, name='api_login'),
    path('auth/logout/', views.logout_api, name='api_logout'),
    path('auth/token/', obtain_auth_token, name='api_token'),
    
    # Attendance
    path('attendance/checkin/', views.check_in, name='api_checkin'),
    path('attendance/checkout/', views.check_out, name='api_checkout'),
    
    # Dashboard
    path('dashboard/stats/', views.dashboard_stats, name='api_dashboard_stats'),
    
    # Utilities
    path('cities/', views.cities_list, name='api_cities'),
    path('notifications/', views.notifications_list, name='api_notifications'),

    # Enhanced Notifications & Job Card Assignment
    path('notifications/pending/', notification_views.pending_notifications, name='api_pending_notifications'),
    path('notifications/send/', notification_views.send_notification, name='api_send_notification'),
    path('jobcard/assign/', notification_views.assign_job_card, name='api_assign_job_card'),
    path('jobcard/<int:job_card_id>/details/', notification_views.job_card_details, name='api_job_card_details'),
    path('jobcard/<int:job_card_id>/status/', notification_views.update_job_card_status, name='api_update_job_card_status'),
    path('jobcard/updates/', notification_views.job_card_updates, name='api_job_card_updates'),
    path('employee/<int:employee_id>/details/', notification_views.employee_details, name='api_employee_details'),

    # Integrations / Webhooks
    path('integrations/whatsapp/webhook/', views.whatsapp_webhook, name='api_whatsapp_webhook'),
    path('integrations/email/inbound/', views.email_inbound, name='api_email_inbound'),

    # Triggers
    path('integrations/gdrive/sync/', views.trigger_gdrive_sync, name='api_gdrive_sync'),
    path('integrations/whatsapp/process/', views.trigger_whatsapp_processing, name='api_whatsapp_process'),
    
    # ViewSets
    path('', include(router.urls)),
]
