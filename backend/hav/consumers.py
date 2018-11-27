from channels.generic.websocket import AsyncJsonWebsocketConsumer


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
        await self.send_json({'txt': 'Hello world!'})

    @property
    def ingest_queue(self):
        return self.scope['url_route']['kwargs']['uuid']

    async def ingest_progress(self, event):
        print(event)
        await self.send_json({
            "msg": event.get('msg', '')
        })