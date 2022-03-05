from django.conf import settings
from django.urls import path, include
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse as django_reverse

from hav.apps.sources.filesystem import FSSource
from hav.apps.sources.whav import WHAVSource
from hav.apps.sources.uploads import UploadSource

from .havBrowser.urls import hav_urls
from .ingest.urls import ingest_urls
from .auth import AuthStatusView
from .misc_models.urls import urlpatterns as model_url_patterns

# TODO: this is a duplication of the sources defined in settings.py
incoming_fss_source = FSSource(settings.INCOMING_FILES_ROOT, source_id="incoming")
whav_source = WHAVSource()
upload_source = UploadSource(settings.MEDIA_ROOT, source_id="upload")

app_name = "api"


@api_view(["GET"])
def start(request):
    def reverse(name):
        return django_reverse(f"api:v1:{name}", request=request)

    # build a structure for all patterns defined in misc models
    misc_models = {}
    for pattern in model_url_patterns:
        name = pattern.name
        misc_models.update({name: reverse(f"models:{name}")})

    return Response(
        {
            "hav": reverse("hav_browser:hav_root"),
            "sources": [
                {"name": "Incoming", "url": reverse("filebrowser_root")},
                {"name": "WHAV", "url": reverse("whav_root")},
                {"name": "Uploads", "url": reverse("fileupload")},
            ],
            "models": misc_models,
        }
    )


source_patterns = [
    path("incoming/", include(incoming_fss_source.urls)),
    path("whav/", include(whav_source.urls)),
    path("upload/", include(upload_source.urls)),
]

urlpatterns = [
    path("", start, name="api_root"),
    path("auth/", AuthStatusView.as_view(), name="auth_status"),
    path("ingest/", include((ingest_urls, "ingest"))),
    path("sources/", include(source_patterns)),
    path("hav/", include((hav_urls("hav"), app_name), namespace="hav_browser")),
    path("models/", include((model_url_patterns, "models"))),
]
