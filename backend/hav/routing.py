
from django.urls import path
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

from . import consumers

application = ProtocolTypeRouter({
    # Empty for now (http->django views is added by default)
    "websocket": AuthMiddlewareStack(
        URLRouter([
            path("<path:prefix>/<uuid:uuid>/", consumers.IngestUpdatesConsumer),
        ])
    ),
})