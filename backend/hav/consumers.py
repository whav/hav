from channels.generic.websocket import AsyncJsonWebsocketConsumer


class IngestUpdatesConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        print('WS connecting...')
        from pprint import pprint
        pprint(self.scope)
        print(self.scope['url_route']['kwargs']['uuid'])
        await self.accept()
