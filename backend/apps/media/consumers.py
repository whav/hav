from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.urls import reverse

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
        if 'media_id' in message:
            message.update({'url': reverse('api:v1:hav_browser:hav_media', kwargs={'pk': message['media_id']})})
            await self.send_json(message)


