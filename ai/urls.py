"""
AI Chatbot URLs
"""

from django.urls import path
from . import views

app_name = 'ai'

urlpatterns = [
    # Chatbot interface
    path('', views.chatbot_interface, name='chatbot_interface'),
    path('chat/', views.chatbot_interface, name='chatbot_chat'),
    
    # API endpoints
    path('api/chat/', views.chatbot_response, name='chatbot_response'),
    path('api/chatbot/', views.ChatbotAPIView.as_view(), name='chatbot_api'),
]
