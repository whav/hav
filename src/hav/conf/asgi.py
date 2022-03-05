import os

from django.core.asgi import get_asgi_application
from django.conf.urls import url, re_path

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "hav.conf.settings")

django_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
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
