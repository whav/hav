from django.core.management.base import BaseCommand

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class Command(BaseCommand):
    help = "My shiny new management command."


    def handle(self, *args, **options):
        channel_layer = get_channel_layer()
        print(channel_layer)
        async_to_sync(channel_layer.group_send)("media", {"type": "media.task_update", "message": "Test message"})
