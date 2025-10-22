"""
Custom template filters for the Social module
"""
from django import template
from django.utils.safestring import mark_safe
import json

register = template.Library()

# Test to ensure the module loads correctly
print("Social filters template tags loaded successfully")

# Emoji mapping for reactions
REACTION_EMOJIS = {
    'like': '👍',
    'love': '❤️',
    'laugh': '😂',
    'wow': '😮',
    'sad': '😢',
    'angry': '😠',
    'thumbs_up': '👍',
    'thumbs_down': '👎',
    'heart': '❤️',
    'fire': '🔥',
    'clap': '👏',
    'party': '🎉',
    'rocket': '🚀',
    'eyes': '👀',
    'thinking': '🤔',
    'check': '✅',
    'cross': '❌',
    'star': '⭐',
    'smile': '😊',
    'wink': '😉'
}

@register.filter
def lookup_reaction_emoji(reaction_type):
    """
    Convert reaction type to emoji
    Usage: {{ reaction.reaction_type|lookup_reaction_emoji }}
    """
    return REACTION_EMOJIS.get(reaction_type, reaction_type)

@register.filter
def dm_display_name(group, current_user):
    """
    Get display name for direct message groups
    Usage: {{ group|dm_display_name:request.user }}
    """
    if group.group_type != 'DIRECT':
        return group.name
    
    # Get the other user in the DM
    other_member = group.members.filter(is_active=True).exclude(user=current_user).first()
    if other_member:
        return f"{other_member.user.first_name} {other_member.user.last_name}"
    
    return "Direct Message"

@register.filter
def get_item(dictionary, key):
    """
    Get item from dictionary by key
    Usage: {{ dict|get_item:key }}
    """
    if hasattr(dictionary, 'get'):
        return dictionary.get(key)
    return None

@register.filter
def to_json(value):
    """
    Convert value to JSON string
    Usage: {{ data|to_json }}
    """
    return mark_safe(json.dumps(value))

@register.filter
def file_size_format(bytes_size):
    """
    Format file size in human readable format
    Usage: {{ file.size|file_size_format }}
    """
    if not bytes_size:
        return "0 B"
    
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes_size < 1024.0:
            return f"{bytes_size:.1f} {unit}"
        bytes_size /= 1024.0
    return f"{bytes_size:.1f} TB"

@register.filter
def truncate_filename(filename, max_length=30):
    """
    Truncate filename if too long
    Usage: {{ filename|truncate_filename:25 }}
    """
    if not filename or len(filename) <= max_length:
        return filename
    
    name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
    if ext:
        available_length = max_length - len(ext) - 4  # 4 for "..." and "."
        if available_length > 0:
            return f"{name[:available_length]}...{ext}"
    
    return f"{filename[:max_length-3]}..."

@register.filter
def user_initials(user):
    """
    Get user initials for avatar
    Usage: {{ user|user_initials }}
    """
    if hasattr(user, 'first_name') and hasattr(user, 'last_name'):
        first = user.first_name.strip()
        last = user.last_name.strip()
        if first and last:
            return f"{first[0]}{last[0]}".upper()
        elif first:
            return first[0].upper()
        elif last:
            return last[0].upper()
    
    if hasattr(user, 'username'):
        username = user.username.strip()
        if username:
            return username[0].upper()
    
    return "U"

@register.filter
def message_time_format(timestamp):
    """
    Format message timestamp
    Usage: {{ message.created_at|message_time_format }}
    """
    from django.utils import timezone
    from datetime import datetime, timedelta
    
    now = timezone.now()
    diff = now - timestamp
    
    if diff.days == 0:
        # Today - show time
        return timestamp.strftime("%I:%M %p")
    elif diff.days == 1:
        # Yesterday
        return f"Yesterday {timestamp.strftime('%I:%M %p')}"
    elif diff.days < 7:
        # This week - show day and time
        return timestamp.strftime("%a %I:%M %p")
    else:
        # Older - show date and time
        return timestamp.strftime("%m/%d/%y %I:%M %p")

@register.simple_tag
def reaction_count(message, reaction_type):
    """
    Get count of specific reaction type for a message
    Usage: {% reaction_count message 'like' %}
    """
    if hasattr(message, 'reactions'):
        return message.reactions.filter(reaction_type=reaction_type).count()
    return 0

@register.simple_tag
def user_reacted(message, user, reaction_type):
    """
    Check if user has reacted with specific reaction type
    Usage: {% user_reacted message user 'like' %}
    """
    if hasattr(message, 'reactions') and user.is_authenticated:
        return message.reactions.filter(user=user, reaction_type=reaction_type).exists()
    return False

@register.filter
def profile_pic_url(user, default='/static/dist/img/default-150x150.png'):
    """
    Safely get profile picture URL
    Usage: {{ user|profile_pic_url }}
    """
    try:
        if hasattr(user, 'profile_pic') and user.profile_pic and user.profile_pic.name:
            return user.profile_pic.url
    except (ValueError, AttributeError):
        pass
    return default

@register.inclusion_tag('social/partials/message_reactions.html')
def show_message_reactions(message, current_user):
    """
    Show message reactions
    Usage: {% show_message_reactions message user %}
    """
    reactions = {}
    if hasattr(message, 'reactions'):
        for reaction in message.reactions.all():
            if reaction.reaction_type not in reactions:
                reactions[reaction.reaction_type] = {
                    'count': 0,
                    'users': [],
                    'user_reacted': False
                }
            reactions[reaction.reaction_type]['count'] += 1
            reactions[reaction.reaction_type]['users'].append(reaction.user)
            if current_user.is_authenticated and reaction.user == current_user:
                reactions[reaction.reaction_type]['user_reacted'] = True
    
    return {
        'message': message,
        'reactions': reactions,
        'current_user': current_user,
        'emoji_map': REACTION_EMOJIS
    }
