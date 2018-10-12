from channels.generic.websocket import AsyncJsonWebsocketConsumer


class MediaEventConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        """
        Called when the websocket is handshaking as part of initial connection.
        """
        user = self.scope.get('user')
        if user.is_staff:
            await self.accept()
        else:
            await self.close()


    async def receive_json(self, content):
        print("JSON message received:", content)

