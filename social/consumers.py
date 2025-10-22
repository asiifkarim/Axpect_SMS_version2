import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.utils import timezone
from main_app.models import (
    CustomUser, ChatGroup, ChatMessage, ChatGroupMember, ChatMessageDelivery,
    NotificationEmployee, NotificationManager, Employee, Manager
)
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

logger = logging.getLogger(__name__)


class ChatConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time chat messaging"""
    
    async def connect(self):
        self.group_id = self.scope['url_route']['kwargs']['group_id']
        self.room_group_name = f'chat_{self.group_id}'
        self.user = self.scope["user"]
        
        # Check if user is authenticated
        if isinstance(self.user, AnonymousUser):
            await self.close()
            return
        
        # Check if user has access to this group
        has_access = await self.check_group_access()
        if not has_access:
            await self.close()
            return
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Update user online status
        await self.update_user_status(True)
        
        # Notify group about user joining
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_status',
                'user_id': self.user.id,
                'status': 'online',
                'timestamp': timezone.now().isoformat()
            }
        )
    
    async def disconnect(self, close_code):
        # Update user online status
        await self.update_user_status(False)
        
        # Notify group about user leaving
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_status',
                    'user_id': self.user.id,
                    'status': 'offline',
                    'timestamp': timezone.now().isoformat()
                }
            )
            
            # Leave room group
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type')
            
            if message_type == 'chat_message':
                await self.handle_chat_message(text_data_json)
            elif message_type == 'typing_indicator':
                await self.handle_typing_indicator(text_data_json)
            elif message_type == 'message_read':
                await self.handle_message_read(text_data_json)
            elif message_type == 'message_reaction':
                await self.handle_message_reaction(text_data_json)
            else:
                logger.warning(f"Unknown message type: {message_type}")
                
        except json.JSONDecodeError:
            logger.error("Invalid JSON received")
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
    
    async def handle_chat_message(self, data):
        """Handle incoming chat messages"""
        content = data.get('content', '').strip()
        reply_to_id = data.get('reply_to')
        
        logger.info(f"Handling chat message from user {self.user.id}: {content[:50]}...")
        
        if not content:
            logger.warning(f"Empty message content from user {self.user.id}")
            return
        
        # Save message to database
        message = await self.save_message(content, reply_to_id)
        
        if message:
            logger.info(f"Message saved with ID {message.id}")
            
            # Serialize message for WebSocket transmission
            serialized_message = await self.serialize_message(message)
            logger.info(f"Message serialized: {serialized_message['id']}")
            
            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': serialized_message
                }
            )
            
            logger.info(f"Message sent to room group {self.room_group_name}")
            
            # Create delivery records for all group members
            await self.create_delivery_records(message)
            logger.info(f"Delivery records created for message {message.id}")
            
            # Send notification to DM recipient if this is a direct message
            await self.send_dm_notification(message)
        else:
            logger.error(f"Failed to save message from user {self.user.id}")
    
    async def handle_typing_indicator(self, data):
        """Handle typing indicators"""
        is_typing = data.get('is_typing', False)
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'typing_indicator',
                'user_id': self.user.id,
                'user_name': f"{self.user.first_name} {self.user.last_name}",
                'is_typing': is_typing,
                'timestamp': timezone.now().isoformat()
            }
        )
    
    async def handle_message_read(self, data):
        """Handle message read receipts"""
        message_id = data.get('message_id')
        
        if message_id:
            await self.mark_message_read(message_id)
            
            # Notify sender about read receipt
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'message_read',
                    'message_id': message_id,
                    'user_id': self.user.id,
                    'timestamp': timezone.now().isoformat()
                }
            )
    
    async def handle_message_reaction(self, data):
        """Handle message reactions"""
        message_id = data.get('message_id')
        reaction_type = data.get('reaction_type')
        
        if message_id and reaction_type:
            reaction = await self.toggle_reaction(message_id, reaction_type)
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'message_reaction',
                    'message_id': message_id,
                    'user_id': self.user.id,
                    'reaction_type': reaction_type,
                    'action': 'added' if reaction else 'removed',
                    'timestamp': timezone.now().isoformat()
                }
            )
    
    # WebSocket message handlers
    async def chat_message(self, event):
        """Send chat message to WebSocket"""
        try:
            logger.info(f"Sending chat message to WebSocket: {event['message']['id']}")
            await self.send(text_data=json.dumps({
                'type': 'chat_message',
                'message': event['message'],
                'sound_type': 'message'  # Add sound trigger for new messages
            }))
            logger.info(f"Chat message sent successfully to WebSocket")
        except Exception as e:
            logger.error(f"Error sending chat message to WebSocket: {str(e)}")
    
    async def typing_indicator(self, event):
        """Send typing indicator to WebSocket"""
        # Don't send typing indicator back to the sender
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'typing_indicator',
                'user_id': event['user_id'],
                'user_name': event['user_name'],
                'is_typing': event['is_typing'],
                'timestamp': event['timestamp']
            }))
    
    async def message_read(self, event):
        """Send read receipt to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'message_read',
            'message_id': event['message_id'],
            'user_id': event['user_id'],
            'timestamp': event['timestamp']
        }))
    
    async def message_reaction(self, event):
        """Send reaction to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'message_reaction',
            'message_id': event['message_id'],
            'user_id': event['user_id'],
            'reaction_type': event['reaction_type'],
            'action': event['action'],
            'timestamp': event['timestamp']
        }))
    
    async def user_status(self, event):
        """Send user status update to WebSocket"""
        # Don't send status update back to the user themselves
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'user_status',
                'user_id': event['user_id'],
                'status': event['status'],
                'timestamp': event['timestamp']
            }))
    
    # Database operations
    @database_sync_to_async
    def check_group_access(self):
        """Check if user has access to the chat group"""
        try:
            group = ChatGroup.objects.get(id=self.group_id, is_active=True)
            return ChatGroupMember.objects.filter(
                group=group,
                user=self.user,
                is_active=True
            ).exists()
        except ChatGroup.DoesNotExist:
            return False
    
    @database_sync_to_async
    def save_message(self, content, reply_to_id=None):
        """Save message to database and create notifications"""
        try:
            group = ChatGroup.objects.get(id=self.group_id)
            reply_to = None
            
            if reply_to_id:
                try:
                    reply_to = ChatMessage.objects.get(id=reply_to_id, group=group)
                except ChatMessage.DoesNotExist:
                    pass
            
            message = ChatMessage.objects.create(
                group=group,
                sender=self.user,
                content=content,
                reply_to=reply_to,
                message_type='TEXT'
            )
            
            # Create notifications for all group members except sender
            self._create_message_notifications(group, message)
            
            return message
        except Exception as e:
            logger.error(f"Error saving message: {str(e)}")
            return None
    
    def _create_message_notifications(self, group, message):
        """Create notifications for group members about new message"""
        try:
            # Get all active members except the sender
            members = ChatGroupMember.objects.filter(
                group=group,
                is_active=True
            ).exclude(user=self.user).select_related('user')
            
            # Preview message (first 50 chars)
            preview = message.content[:50] + '...' if len(message.content) > 50 else message.content
            sender_name = f"{self.user.first_name} {self.user.last_name}".strip() or self.user.username
            
            # Determine group name for notification
            if group.is_direct_message:
                group_name = "sent you a message"
            else:
                group_name = f"in {group.name}"
            
            for member in members:
                try:
                    # Create appropriate notification based on user type
                    if member.user.user_type == '1':  # Admin
                        from main_app.models import Admin, NotificationAdmin
                        admin = Admin.objects.get(admin=member.user)
                        NotificationAdmin.objects.create(
                            admin=admin,
                            message=f"{sender_name} {group_name}: {preview}"
                        )
                    elif member.user.user_type == '3':  # Employee
                        employee = Employee.objects.get(admin=member.user)
                        NotificationEmployee.objects.create(
                            employee=employee,
                            message=f"{sender_name} {group_name}: {preview}"
                        )
                    elif member.user.user_type == '2':  # Manager
                        manager = Manager.objects.get(admin=member.user)
                        NotificationManager.objects.create(
                            manager=manager,
                            message=f"{sender_name} {group_name}: {preview}"
                        )
                    
                    # Send WebSocket notification to the user
                    channel_layer = get_channel_layer()
                    if channel_layer:
                        try:
                            async_to_sync(channel_layer.group_send)(
                                f'notifications_{member.user.id}',
                                {
                                    'type': 'notification_message',
                                    'notification': {
                                        'id': f'msg_{message.id}_{member.user.id}',
                                        'type': 'message',
                                        'title': 'New Message',
                                        'message': f"{sender_name}: {preview}",
                                        'level': 'info',
                                        'group_id': group.id,
                                        'redirect_url': f'/social/chat/{group.id}/',
                                        'created_at': message.created_at.isoformat()
                                    },
                                    'sound_type': 'message'
                                }
                            )
                        except Exception as ws_error:
                            logger.error(f"Error sending WebSocket notification: {str(ws_error)}")
                    
                except Exception as profile_error:
                    logger.warning(f"User profile not found for user {member.user.id}: {str(profile_error)}")
                    continue
                except Exception as e:
                    logger.error(f"Error creating notification for user {member.user.id}: {str(e)}")
                    continue
                    
        except Exception as e:
            logger.error(f"Error creating message notifications: {str(e)}")
    
    @database_sync_to_async
    def serialize_message(self, message):
        """Serialize message for WebSocket transmission"""
        try:
            # Safely get profile pic URL
            profile_pic_url = None
            try:
                if message.sender.profile_pic and message.sender.profile_pic.name:
                    profile_pic_url = message.sender.profile_pic.url
            except (ValueError, AttributeError):
                profile_pic_url = None
            
            return {
                'id': message.id,
                'content': message.content,
                'sender': {
                    'id': message.sender.id,
                    'name': f"{message.sender.first_name} {message.sender.last_name}",
                    'profile_pic': profile_pic_url
                },
                'message_type': message.message_type,
                'reply_to': {
                    'id': message.reply_to.id,
                    'content': message.reply_to.content[:100] + '...' if len(message.reply_to.content) > 100 else message.reply_to.content,
                    'sender_name': f"{message.reply_to.sender.first_name} {message.reply_to.sender.last_name}"
                } if message.reply_to else None,
                'created_at': message.created_at.isoformat(),
                'is_edited': message.is_edited,
                'edited_at': message.edited_at.isoformat() if message.edited_at else None
            }
        except Exception as e:
            logger.error(f"Error serializing message: {str(e)}")
            # Return a minimal message structure if serialization fails
            return {
                'id': message.id,
                'content': message.content,
                'sender': {
                    'id': message.sender.id,
                    'name': f"{message.sender.first_name} {message.sender.last_name}",
                    'profile_pic': None
                },
                'message_type': message.message_type,
                'reply_to': None,
                'created_at': message.created_at.isoformat(),
                'is_edited': False,
                'edited_at': None
            }
    
    @database_sync_to_async
    def create_delivery_records(self, message):
        """Create delivery records for all group members"""
        try:
            group_members = ChatGroupMember.objects.filter(
                group=message.group,
                is_active=True
            ).exclude(user=message.sender)
            
            delivery_records = []
            for member in group_members:
                delivery_records.append(
                    ChatMessageDelivery(
                        message=message,
                        user=member.user,
                        status='SENT'
                    )
                )
            
            ChatMessageDelivery.objects.bulk_create(delivery_records)
        except Exception as e:
            logger.error(f"Error creating delivery records: {str(e)}")
    
    @database_sync_to_async
    def mark_message_read(self, message_id):
        """Mark message as read"""
        try:
            ChatMessageDelivery.objects.filter(
                message_id=message_id,
                user=self.user
            ).update(
                status='READ',
                read_at=timezone.now()
            )
        except Exception as e:
            logger.error(f"Error marking message as read: {str(e)}")
    
    @database_sync_to_async
    def toggle_reaction(self, message_id, reaction_type):
        """Toggle message reaction"""
        try:
            from main_app.models import ChatMessageReaction
            
            reaction, created = ChatMessageReaction.objects.get_or_create(
                message_id=message_id,
                user=self.user,
                reaction_type=reaction_type
            )
            
            if not created:
                reaction.delete()
                return False
            return True
        except Exception as e:
            logger.error(f"Error toggling reaction: {str(e)}")
            return False
    
    @database_sync_to_async
    def update_user_status(self, is_online):
        """Update user online status"""
        try:
            # Only update status for authenticated users
            if isinstance(self.user, AnonymousUser):
                return
            
            self.user.is_online = is_online
            self.user.last_seen = timezone.now()
            self.user.save(update_fields=['is_online', 'last_seen'])
        except Exception as e:
            logger.error(f"Error updating user status: {str(e)}")
    
    @database_sync_to_async
    def get_dm_recipient(self, group):
        """Get the other user in a DM conversation"""
        try:
            members = ChatGroupMember.objects.filter(
                group=group, is_active=True
            ).exclude(user=self.user)
            return members.first().user if members.exists() else None
        except Exception as e:
            logger.error(f"Error getting DM recipient: {str(e)}")
            return None
    
    async def send_dm_notification(self, message):
        """Send notification to DM recipient if they're not in the chat room"""
        try:
            # Get the group for this message
            group = await self.get_group_by_id(self.group_id)
            if not group or group.group_type != 'DIRECT':
                return
            
            # Get the recipient
            recipient = await self.get_dm_recipient(group)
            if not recipient:
                logger.warning(f"No recipient found for DM group {self.group_id}")
                return
            
            # Send notification to recipient's notification channel
            await self.channel_layer.group_send(
                f'notifications_{recipient.id}',
                {
                    'type': 'notification_message',
                    'notification': {
                        'id': message.id,
                        'type': 'direct_message',
                        'title': f'New message from {self.user.get_full_name()}',
                        'message': f'{self.user.get_full_name()}: {message.content[:50]}{"..." if len(message.content) > 50 else ""}',
                        'group_id': group.id,
                        'created_at': timezone.now().isoformat()
                    },
                    'sound_type': 'message'
                }
            )
            logger.info(f"DM notification sent to user {recipient.id}")
        except Exception as e:
            logger.error(f"Error sending DM notification: {str(e)}")
    
    @database_sync_to_async
    def get_group_by_id(self, group_id):
        """Get group by ID"""
        try:
            return ChatGroup.objects.get(id=group_id)
        except ChatGroup.DoesNotExist:
            return None
        except Exception as e:
            logger.error(f"Error getting group by ID: {str(e)}")
            return None


class NotificationConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time notifications"""
    
    async def connect(self):
        self.user = self.scope["user"]
        
        # Check if user is authenticated
        if isinstance(self.user, AnonymousUser):
            await self.close()
            return
        
        self.notification_group_name = f'notifications_{self.user.id}'
        
        # Join notification group
        await self.channel_layer.group_add(
            self.notification_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        # Leave notification group
        if hasattr(self, 'notification_group_name'):
            await self.channel_layer.group_discard(
                self.notification_group_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type')
            
            if message_type == 'mark_notification_read':
                notification_id = text_data_json.get('notification_id')
                await self.mark_notification_read(notification_id)
                
        except json.JSONDecodeError:
            logger.error("Invalid JSON received in notification consumer")
        except Exception as e:
            logger.error(f"Error processing notification message: {str(e)}")
    
    async def notification_message(self, event):
        """Send notification to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'notification': event['notification'],
            'sound_type': event.get('sound_type', 'default')  # Add sound trigger
        }))
    
    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        """Mark notification as read"""
        try:
            # This would integrate with existing notification system
            # For now, we'll just log it
            logger.info(f"Marking notification {notification_id} as read for user {self.user.id}")
        except Exception as e:
            logger.error(f"Error marking notification as read: {str(e)}")
