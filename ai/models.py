"""
AI Chatbot Models
Models for storing chat sessions and conversation history
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

User = get_user_model()


class ChatSession(models.Model):
    """Represents a chat session for a user"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_sessions')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['is_active', 'created_at']),
        ]
    
    def __str__(self):
        return f"Chat Session {self.id} - {self.user.email}"


class ChatMessage(models.Model):
    """Represents a single message in a chat session"""
    
    MESSAGE_TYPES = [
        ('user', 'User Message'),
        ('bot', 'Bot Response'),
        ('system', 'System Message'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Context and metadata
    intent = models.CharField(max_length=50, blank=True, null=True)
    entities = models.JSONField(default=dict, blank=True)
    action_executed = models.CharField(max_length=100, blank=True, null=True)
    action_result = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['timestamp']
        indexes = [
            models.Index(fields=['session', 'timestamp']),
            models.Index(fields=['message_type', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.message_type}: {self.content[:50]}..."


class ChatContext(models.Model):
    """Stores context information for chat sessions"""
    
    session = models.OneToOneField(ChatSession, on_delete=models.CASCADE, related_name='context')
    current_entities = models.JSONField(default=dict, blank=True)  # Current conversation entities
    last_intent = models.CharField(max_length=50, blank=True, null=True)
    conversation_summary = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Context for {self.session}"
