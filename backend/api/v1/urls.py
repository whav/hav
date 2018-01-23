from django.conf.urls import url, include
from django.conf import settings

from .ingest import PrepareIngestView, IngestQueueView
from .fsBrowser.urls import fs_urls
from .whavBrowser.urls import whav_urls
from .havBrowser.urls import hav_urls

from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.reverse import reverse

app_name = 'api'

@api_view(['GET'])
def start(request):
    return Response(
        {
            "hav": reverse('api:v1:hav_browser:hav_root', request=request)
        }
    )

urlpatterns = [
    url('^$', start),
    url(r'^ingest/data/$', PrepareIngestView.as_view(), name='prepare_ingest'),
    url(r'^ingest/$', IngestQueueView.as_view(), name='ingest'),
    url(r'^incoming/', include(
        (fs_urls(root_path=settings.INCOMING_FILES_ROOT, identifier='incoming'), app_name),
        namespace='fs_browser'
    )),
    url(r'^whav/', include(
        (whav_urls('whav'), app_name),
        namespace='whav_browser')
    ),
    url(r'^hav/', include(
        (hav_urls('hav'), app_name),
        namespace='hav_browser')
    )
]
