from apps.media.models import Media

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async

class MediaEventConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        user = self.scope.get('user')

        if user.is_staff:
            await self.accept()
        else:
            await self.close()

        # add to media group
        await self.channel_layer.group_add('media', self.channel_name)

    async def media_task_update(self, message):
        print("Media message received.", message)
        await self.send_json(message)


