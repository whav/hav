import json
from django.core.serializers.json import DjangoJSONEncoder
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async


class IngestUpdatesConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        # TODO check for ingest permissions
        await self.accept()
        await self.channel_layer.group_add(
            str(self.ingest_queue),
            self.channel_name
        )
        await self.channel_layer.group_add(
            "ingest",
            self.channel_name
        )

    @database_sync_to_async
    def serialize_media(self, media_id):
        from apps.media.models import Media
        from api.v1.havBrowser.serializers import HAVMediaSerializer
        media = Media.objects.get(pk=media_id)
        headers = self.scope['headers']
        hostname = list(filter(lambda h: h[0] == b'origin', headers))[0][1].decode()
        serializer = HAVMediaSerializer(instance=media, context={'hostname': hostname})
        return serializer.data

    @property
    def ingest_queue(self):
        return self.scope['url_route']['kwargs']['uuid']

    async def ingest_progress(self, event):
        media_id = event['media_id']
        payload = await self.serialize_media(media_id)
        payload.update({
            'msg': event.get('msg', '')
        })
        await self.send_json(payload)

    @classmethod
    async def encode_json(cls, content):
        return json.dumps(content, cls=DjangoJSONEncoder)
