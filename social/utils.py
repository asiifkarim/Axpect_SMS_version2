from django.db.models import Q
from main_app.models import ChatGroup, ChatGroupMember, CustomUser


def get_user_groups(user):
    """Get all chat groups that a user is a member of"""
    return ChatGroup.objects.filter(
        members__user=user,
        members__is_active=True,
        is_active=True
    ).distinct().order_by('name')


def create_direct_message_group(user1, user2):
    """Create or get existing direct message group between two users"""
    # Check if DM group already exists
    existing_groups = ChatGroup.objects.filter(
        group_type='DIRECT',
        members__user=user1,
        is_active=True
    ).filter(
        members__user=user2
    ).distinct()
    
    if existing_groups.exists():
        return existing_groups.first()
    
    # Create new DM group with a simple name that shows the other user's name
    # The name will be dynamically displayed based on who is viewing it
    group_name = f"DM_{min(user1.id, user2.id)}_{max(user1.id, user2.id)}"
    
    group = ChatGroup.objects.create(
        name=group_name,
        group_type='DIRECT',
        description=f"Direct message between {user1.get_full_name()} and {user2.get_full_name()}",
        created_by=user1,
        is_active=True,
        allow_file_sharing=True,
        max_members=2
    )
    
    # Add both users as members
    ChatGroupMember.objects.create(
        group=group,
        user=user1,
        role='MEMBER',
        is_active=True
    )
    
    ChatGroupMember.objects.create(
        group=group,
        user=user2,
        role='MEMBER',
        is_active=True
    )
    
    return group


def get_dm_display_name(group, current_user):
    """Get display name for direct message group (shows the other user's name)"""
    if group.group_type != 'DIRECT':
        return group.name
    
    # Get the other user in the DM
    other_member = group.members.filter(is_active=True).exclude(user=current_user).first()
    if other_member:
        return f"{other_member.user.first_name} {other_member.user.last_name}"
    
    return "Direct Message"


def get_unread_message_count(user):
    """Get total unread message count for a user"""
    memberships = ChatGroupMember.objects.filter(
        user=user,
        is_active=True,
        group__is_active=True
    )
    
    total_unread = 0
    for membership in memberships:
        total_unread += membership.unread_count
    
    return total_unread


def search_messages(user, query, group_id=None):
    """Search messages for a user"""
    # Get user's groups
    user_groups = get_user_groups(user)
    
    # Filter by specific group if provided
    if group_id:
        user_groups = user_groups.filter(id=group_id)
    
    # Search messages
    from main_app.models import ChatMessage
    messages = ChatMessage.objects.filter(
        group__in=user_groups,
        is_deleted=False,
        content__icontains=query
    ).select_related('sender', 'group').order_by('-created_at')
    
    return messages[:50]  # Limit results


def can_user_manage_group(user, group):
    """Check if user can manage a group (admin/moderator permissions)"""
    try:
        membership = ChatGroupMember.objects.get(
            group=group,
            user=user,
            is_active=True
        )
        return membership.role in ['ADMIN', 'MODERATOR']
    except ChatGroupMember.DoesNotExist:
        return False


def get_group_members_with_status(group):
    """Get group members with their online status"""
    members = ChatGroupMember.objects.filter(
        group=group,
        is_active=True
    ).select_related('user').order_by('user__first_name', 'user__last_name')
    
    members_data = []
    for member in members:
        members_data.append({
            'membership': member,
            'user': member.user,
            'is_online': member.user.is_online,
            'last_seen': member.user.last_seen,
            'role': member.role,
            'can_manage': member.role in ['ADMIN', 'MODERATOR']
        })
    
    return members_data


def format_file_size(size_bytes):
    """Format file size in human readable format"""
    if not size_bytes:
        return "0 B"
    
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024.0
    
    return f"{size_bytes:.1f} TB"


def is_image_file(filename):
    """Check if file is an image based on extension"""
    if not filename:
        return False
    
    image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg']
    return any(filename.lower().endswith(ext) for ext in image_extensions)


def get_file_icon_class(filename):
    """Get CSS icon class for file type"""
    if not filename:
        return 'fas fa-file'
    
    filename_lower = filename.lower()
    
    if any(filename_lower.endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']):
        return 'fas fa-image'
    elif any(filename_lower.endswith(ext) for ext in ['.pdf']):
        return 'fas fa-file-pdf'
    elif any(filename_lower.endswith(ext) for ext in ['.doc', '.docx']):
        return 'fas fa-file-word'
    elif any(filename_lower.endswith(ext) for ext in ['.xls', '.xlsx']):
        return 'fas fa-file-excel'
    elif any(filename_lower.endswith(ext) for ext in ['.ppt', '.pptx']):
        return 'fas fa-file-powerpoint'
    elif any(filename_lower.endswith(ext) for ext in ['.zip', '.rar', '.7z']):
        return 'fas fa-file-archive'
    elif any(filename_lower.endswith(ext) for ext in ['.mp4', '.avi', '.mov', '.wmv']):
        return 'fas fa-file-video'
    elif any(filename_lower.endswith(ext) for ext in ['.mp3', '.wav', '.flac']):
        return 'fas fa-file-audio'
    else:
        return 'fas fa-file'
