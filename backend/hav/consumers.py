from channels.generic.websocket import AsyncJsonWebsocketConsumer


class IngestUpdatesConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        # TODO check for ingest permissions
        await self.accept()

    @property
    def ingest_queue(self):
        return self.scope['url_route']['kwargs']['uuid']
