import os

from django.conf.urls import re_path, url
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "hav.conf.settings")

django_app = get_asgi_application()

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter

from hav.views.api.v1.ingest import consumers

application = ProtocolTypeRouter(
    {
        # Django's ASGI application to handle traditional HTTP requests
        "http": django_app,
        # WebSocket handler
        "websocket": AuthMiddlewareStack(
            URLRouter(
                [
                    re_path(
                        "d/ws/admin/ingest/(?P<uuid>[\w-]+)/$",
                        consumers.IngestUpdatesConsumer.as_asgi(),
                    ),
                ]
            )
        ),
    }
)
