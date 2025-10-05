from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/social/chat/(?P<group_id>\w+)/$', consumers.ChatConsumer.as_asgi()),
    re_path(r'ws/social/notifications/$', consumers.NotificationConsumer.as_asgi()),
]
