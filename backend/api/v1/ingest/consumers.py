from channels.generic.websocket import JsonWebsocketConsumer
from asgiref.sync import async_to_sync


class IngestUpdatesConsumer(JsonWebsocketConsumer):

    def connect(self):
        # TODO check for ingest permissions
        self.accept()
        async_to_sync(self.channel_layer.group_add)(
            str(self.ingest_queue),
            self.channel_name
        )

    @property
    def ingest_queue(self):
        return self.scope['url_route']['kwargs']['uuid']

    def ingest_progress(self, event):
        self.send_json(event)
