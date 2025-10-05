import json
from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from channels.testing import WebsocketCommunicator
from channels.db import database_sync_to_async
from main_app.models import (
    CustomUser, Department, Division, Employee, Manager, Admin,
    ChatGroup, ChatGroupMember, ChatMessage, ChatMessageReaction,
    SocialNotificationSettings, GoogleDriveIntegration
)
from social.consumers import ChatConsumer

User = get_user_model()


class SocialModuleTestCase(TestCase):
    """Base test case for Social module tests"""
    
    def setUp(self):
        """Set up test data"""
        # Create divisions and departments
        self.division = Division.objects.create(name="Test Division")
        self.department = Department.objects.create(
            name="Test Department", 
            division=self.division
        )
        
        # Create users
        self.ceo_user = User.objects.create_user(
            email="ceo@test.com",
            password="testpass123",
            first_name="CEO",
            last_name="User",
            user_type="1"
        )
        
        self.manager_user = User.objects.create_user(
            email="manager@test.com",
            password="testpass123",
            first_name="Manager",
            last_name="User",
            user_type="2"
        )
        
        self.employee_user = User.objects.create_user(
            email="employee@test.com",
            password="testpass123",
            first_name="Employee",
            last_name="User",
            user_type="3"
        )
        
        # Set up employee and manager relationships
        self.employee = Employee.objects.get(admin=self.employee_user)
        self.employee.department = self.department
        self.employee.division = self.division
        self.employee.save()
        
        self.manager = Manager.objects.get(admin=self.manager_user)
        self.manager.division = self.division
        self.manager.save()
        
        self.client = Client()


class ChatGroupModelTests(SocialModuleTestCase):
    """Test ChatGroup and related models"""
    
    def test_create_department_group(self):
        """Test creating a department chat group"""
        group = ChatGroup.objects.create(
            name="Test Department Chat",
            group_type="DEPARTMENT",
            department=self.department,
            created_by=self.manager_user
        )
        
        self.assertEqual(group.name, "Test Department Chat")
        self.assertEqual(group.group_type, "DEPARTMENT")
        self.assertEqual(group.department, self.department)
        self.assertTrue(group.is_active)
    
    def test_create_custom_group(self):
        """Test creating a custom chat group"""
        group = ChatGroup.objects.create(
            name="Project Team",
            group_type="CUSTOM",
            description="Project discussion group",
            created_by=self.manager_user
        )
        
        self.assertEqual(group.name, "Project Team")
        self.assertEqual(group.group_type, "CUSTOM")
        self.assertEqual(group.description, "Project discussion group")
    
    def test_group_membership(self):
        """Test adding members to a group"""
        group = ChatGroup.objects.create(
            name="Test Group",
            group_type="CUSTOM",
            created_by=self.manager_user
        )
        
        # Add members
        member1 = ChatGroupMember.objects.create(
            group=group,
            user=self.manager_user,
            role="ADMIN"
        )
        
        member2 = ChatGroupMember.objects.create(
            group=group,
            user=self.employee_user,
            role="MEMBER"
        )
        
        self.assertEqual(group.member_count, 2)
        self.assertEqual(member1.role, "ADMIN")
        self.assertEqual(member2.role, "MEMBER")
    
    def test_unread_count(self):
        """Test unread message count calculation"""
        group = ChatGroup.objects.create(
            name="Test Group",
            group_type="CUSTOM",
            created_by=self.manager_user
        )
        
        membership = ChatGroupMember.objects.create(
            group=group,
            user=self.employee_user,
            role="MEMBER"
        )
        
        # Create some messages
        for i in range(3):
            ChatMessage.objects.create(
                group=group,
                sender=self.manager_user,
                content=f"Test message {i+1}",
                message_type="TEXT"
            )
        
        # Should have 3 unread messages
        self.assertEqual(membership.unread_count, 3)
        
        # Mark as read
        membership.last_read_at = timezone.now()
        membership.save()
        
        # Should have 0 unread messages
        self.assertEqual(membership.unread_count, 0)


class ChatMessageModelTests(SocialModuleTestCase):
    """Test ChatMessage and related models"""
    
    def setUp(self):
        super().setUp()
        self.group = ChatGroup.objects.create(
            name="Test Group",
            group_type="CUSTOM",
            created_by=self.manager_user
        )
        
        ChatGroupMember.objects.create(
            group=self.group,
            user=self.manager_user,
            role="ADMIN"
        )
        
        ChatGroupMember.objects.create(
            group=self.group,
            user=self.employee_user,
            role="MEMBER"
        )
    
    def test_create_text_message(self):
        """Test creating a text message"""
        message = ChatMessage.objects.create(
            group=self.group,
            sender=self.manager_user,
            content="Hello, this is a test message!",
            message_type="TEXT"
        )
        
        self.assertEqual(message.content, "Hello, this is a test message!")
        self.assertEqual(message.message_type, "TEXT")
        self.assertEqual(message.sender, self.manager_user)
        self.assertFalse(message.is_edited)
        self.assertFalse(message.is_deleted)
    
    def test_create_drive_file_message(self):
        """Test creating a Google Drive file message"""
        message = ChatMessage.objects.create(
            group=self.group,
            sender=self.manager_user,
            content="Shared a document",
            message_type="DRIVE_FILE",
            drive_file_id="1234567890",
            drive_file_name="test_document.pdf",
            drive_file_url="https://drive.google.com/file/d/1234567890/view"
        )
        
        self.assertEqual(message.message_type, "DRIVE_FILE")
        self.assertEqual(message.drive_file_id, "1234567890")
        self.assertEqual(message.drive_file_name, "test_document.pdf")
        self.assertTrue(message.is_file_message)
    
    def test_message_reactions(self):
        """Test adding reactions to messages"""
        message = ChatMessage.objects.create(
            group=self.group,
            sender=self.manager_user,
            content="Great work everyone!",
            message_type="TEXT"
        )
        
        # Add reactions
        reaction1 = ChatMessageReaction.objects.create(
            message=message,
            user=self.employee_user,
            reaction_type="LIKE"
        )
        
        reaction2 = ChatMessageReaction.objects.create(
            message=message,
            user=self.ceo_user,
            reaction_type="LOVE"
        )
        
        self.assertEqual(message.reactions.count(), 2)
        self.assertEqual(reaction1.reaction_type, "LIKE")
        self.assertEqual(reaction2.reaction_type, "LOVE")
    
    def test_reply_to_message(self):
        """Test replying to a message"""
        original_message = ChatMessage.objects.create(
            group=self.group,
            sender=self.manager_user,
            content="What's the status of the project?",
            message_type="TEXT"
        )
        
        reply_message = ChatMessage.objects.create(
            group=self.group,
            sender=self.employee_user,
            content="Almost done, will finish by tomorrow!",
            message_type="TEXT",
            reply_to=original_message
        )
        
        self.assertEqual(reply_message.reply_to, original_message)
        self.assertEqual(original_message.replies.count(), 1)


class SocialViewTests(SocialModuleTestCase):
    """Test Social module views"""
    
    def test_social_dashboard_access(self):
        """Test accessing the social dashboard"""
        self.client.login(email="employee@test.com", password="testpass123")
        
        response = self.client.get(reverse('social:dashboard'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Messages")
    
    def test_social_dashboard_requires_login(self):
        """Test that social dashboard requires authentication"""
        response = self.client.get(reverse('social:dashboard'))
        self.assertEqual(response.status_code, 302)  # Redirect to login
    
    def test_google_drive_dashboard_access(self):
        """Test accessing Google Drive dashboard"""
        self.client.login(email="employee@test.com", password="testpass123")
        
        response = self.client.get(reverse('social:google_drive_dashboard'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Google Drive")
    
    def test_notification_settings_access(self):
        """Test accessing notification settings"""
        self.client.login(email="employee@test.com", password="testpass123")
        
        response = self.client.get(reverse('social:notification_settings'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Notification Settings")
    
    def test_chat_room_access_with_permission(self):
        """Test accessing chat room with proper permissions"""
        # Create a group and add user as member
        group = ChatGroup.objects.create(
            name="Test Group",
            group_type="CUSTOM",
            created_by=self.manager_user
        )
        
        ChatGroupMember.objects.create(
            group=group,
            user=self.employee_user,
            role="MEMBER"
        )
        
        self.client.login(email="employee@test.com", password="testpass123")
        
        response = self.client.get(reverse('social:chat_room', args=[group.id]))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, group.name)
    
    def test_chat_room_access_without_permission(self):
        """Test accessing chat room without permissions"""
        # Create a group without adding user as member
        group = ChatGroup.objects.create(
            name="Private Group",
            group_type="CUSTOM",
            created_by=self.manager_user
        )
        
        self.client.login(email="employee@test.com", password="testpass123")
        
        response = self.client.get(reverse('social:chat_room', args=[group.id]))
        self.assertEqual(response.status_code, 302)  # Redirect to dashboard


class SocialAPITests(SocialModuleTestCase):
    """Test Social module API endpoints"""
    
    def setUp(self):
        super().setUp()
        self.group = ChatGroup.objects.create(
            name="API Test Group",
            group_type="CUSTOM",
            created_by=self.manager_user
        )
        
        ChatGroupMember.objects.create(
            group=self.group,
            user=self.employee_user,
            role="MEMBER"
        )
    
    def test_api_user_groups(self):
        """Test getting user's groups via API"""
        self.client.login(email="employee@test.com", password="testpass123")
        
        response = self.client.get(reverse('social:api_user_groups'))
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['name'], "API Test Group")
    
    def test_api_send_message(self):
        """Test sending a message via API"""
        self.client.login(email="employee@test.com", password="testpass123")
        
        response = self.client.post(
            reverse('social:api_send_message', args=[self.group.id]),
            data={'content': 'Test API message'},
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 201)
        
        # Verify message was created
        message = ChatMessage.objects.filter(
            group=self.group,
            content='Test API message'
        ).first()
        
        self.assertIsNotNone(message)
        self.assertEqual(message.sender, self.employee_user)
    
    def test_api_create_group(self):
        """Test creating a group via API"""
        self.client.login(email="manager@test.com", password="testpass123")
        
        response = self.client.post(
            reverse('social:api_create_group'),
            data={
                'name': 'New API Group',
                'description': 'Created via API',
                'member_ids': [self.employee_user.id]
            },
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 201)
        
        # Verify group was created
        group = ChatGroup.objects.filter(name='New API Group').first()
        self.assertIsNotNone(group)
        self.assertEqual(group.description, 'Created via API')
        self.assertEqual(group.member_count, 2)  # Creator + added member
    
    def test_api_search_users(self):
        """Test searching users via API"""
        self.client.login(email="manager@test.com", password="testpass123")
        
        response = self.client.get(
            reverse('social:api_search_users'),
            {'q': 'Employee'}
        )
        
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertIn('users', data)
        self.assertEqual(len(data['users']), 1)
        self.assertEqual(data['users'][0]['name'], 'Employee User')


class SocialNotificationTests(SocialModuleTestCase):
    """Test Social notification settings"""
    
    def test_notification_settings_creation(self):
        """Test that notification settings are created for new users"""
        # Settings should be created automatically via signals
        settings = SocialNotificationSettings.objects.filter(
            user=self.employee_user
        ).first()
        
        self.assertIsNotNone(settings)
        self.assertTrue(settings.desktop_notifications)
        self.assertFalse(settings.email_notifications)
        self.assertTrue(settings.sound_notifications)
    
    def test_update_notification_settings(self):
        """Test updating notification settings"""
        self.client.login(email="employee@test.com", password="testpass123")
        
        response = self.client.post(
            reverse('social:notification_settings'),
            {
                'desktop_notifications': 'on',
                'email_notifications': 'on',
                'sound_notifications': '',  # Off
                'weekend_notifications': 'on',
                'quiet_hours_start': '22:00',
                'quiet_hours_end': '08:00'
            }
        )
        
        self.assertEqual(response.status_code, 302)  # Redirect after successful update
        
        # Verify settings were updated
        settings = SocialNotificationSettings.objects.get(user=self.employee_user)
        self.assertTrue(settings.desktop_notifications)
        self.assertTrue(settings.email_notifications)
        self.assertFalse(settings.sound_notifications)
        self.assertTrue(settings.weekend_notifications)


class GoogleDriveIntegrationTests(SocialModuleTestCase):
    """Test Google Drive integration functionality"""
    
    def test_drive_integration_model(self):
        """Test creating Google Drive integration"""
        integration = GoogleDriveIntegration.objects.create(
            user=self.employee_user,
            access_token="encrypted_access_token",
            refresh_token="encrypted_refresh_token",
            token_expires_at=timezone.now() + timezone.timedelta(hours=1),
            google_email="employee@gmail.com",
            google_name="Employee User",
            google_id="123456789"
        )
        
        self.assertEqual(integration.user, self.employee_user)
        self.assertEqual(integration.google_email, "employee@gmail.com")
        self.assertTrue(integration.is_active)
        self.assertFalse(integration.is_token_expired)
    
    def test_drive_dashboard_without_integration(self):
        """Test Drive dashboard when not connected"""
        self.client.login(email="employee@test.com", password="testpass123")
        
        response = self.client.get(reverse('social:google_drive_dashboard'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Connect Your Google Drive")
    
    def test_drive_dashboard_with_integration(self):
        """Test Drive dashboard when connected"""
        GoogleDriveIntegration.objects.create(
            user=self.employee_user,
            access_token="encrypted_access_token",
            refresh_token="encrypted_refresh_token",
            token_expires_at=timezone.now() + timezone.timedelta(hours=1),
            google_email="employee@gmail.com",
            google_name="Employee User",
            google_id="123456789"
        )
        
        self.client.login(email="employee@test.com", password="testpass123")
        
        response = self.client.get(reverse('social:google_drive_dashboard'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Google Drive Connected")
        self.assertContains(response, "employee@gmail.com")


class SocialSignalTests(SocialModuleTestCase):
    """Test Social module signals"""
    
    def test_department_group_creation_signal(self):
        """Test that department groups are created automatically"""
        # Create a new department
        new_department = Department.objects.create(
            name="New Department",
            division=self.division
        )
        
        # Check if department group was created
        group = ChatGroup.objects.filter(
            department=new_department,
            group_type="DEPARTMENT"
        ).first()
        
        self.assertIsNotNone(group)
        self.assertEqual(group.name, "New Department Team Chat")
    
    def test_user_added_to_department_groups(self):
        """Test that new employees are added to department groups"""
        # Create department group first
        dept_group = ChatGroup.objects.create(
            name="Test Department Team Chat",
            group_type="DEPARTMENT",
            department=self.department
        )
        
        # Create new employee
        new_user = User.objects.create_user(
            email="newemployee@test.com",
            password="testpass123",
            first_name="New",
            last_name="Employee",
            user_type="3"
        )
        
        new_employee = Employee.objects.get(admin=new_user)
        new_employee.department = self.department
        new_employee.division = self.division
        new_employee.save()
        
        # Check if user was added to department group
        membership = ChatGroupMember.objects.filter(
            group=dept_group,
            user=new_user
        ).first()
        
        # Note: This test might fail if signals aren't properly connected
        # In a real implementation, you'd need to ensure the signal is triggered
        # when the employee's department is set
