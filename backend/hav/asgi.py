import os

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
from django.conf.urls import url, re_path
from api.v1.ingest import consumers

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "hav.settings")

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
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
