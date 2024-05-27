import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from django.urls import re_path

# we need to get the django app before importing our api consumers
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "hav.conf.settings")

django_app = get_asgi_application()

from hav.views.api.v1.ingest import consumers  # NOQA E402

application = ProtocolTypeRouter(
    {
        # Django's ASGI application to handle traditional HTTP requests
        "http": django_app,
        # WebSocket handler
        "websocket": AuthMiddlewareStack(
            URLRouter(
                [
                    re_path(
                        "d/ws/admin/ingest/(?P<uuid>[\\w-]+)/$",
                        consumers.IngestUpdatesConsumer.as_asgi(),
                    ),
                ]
            )
        ),
    }
)
