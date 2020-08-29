from django.urls import path
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

from api.v1.ingest import consumers

application = ProtocolTypeRouter(
    {
        "websocket": AuthMiddlewareStack(
            URLRouter(
                [
                    path(
                        "ws/admin/ingest/<uuid:uuid>/", consumers.IngestUpdatesConsumer
                    ),
                ]
            )
        ),
    }
)
