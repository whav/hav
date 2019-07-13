from django.conf import settings
from django.conf.urls import url, include
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse

from sources.filesystem import FSSource
from sources.whav import WHAVSource
from sources.uploads import UploadSource

from .havBrowser.urls import hav_urls
from .ingest.urls import ingest_urls

# TODO: this is a duplication of the sources defined in settings.py
incoming_fss_source = FSSource(settings.INCOMING_FILES_ROOT, source_id='incoming')
whav_source = WHAVSource()
upload_source = UploadSource(settings.MEDIA_ROOT, source_id='upload')

app_name = 'api'

@api_view(['GET'])
def start(request):
    return Response(
        {
            "hav": reverse('api:v1:hav_browser:hav_root', request=request),
            "sources": [
                {
                    "name": "Incoming",
                    "url": reverse('api:v1:filebrowser_root', request=request)
                },
                {
                    "name": "WHAV",
                    "url": reverse("api:v1:whav_root", request=request)
                },
                {
                    "name": "Uploads",
                    "url": reverse("api:v1:fileupload", request=request)

                }
            ]
        }
    )

source_patterns = [
    url(r'^incoming/', include(incoming_fss_source.urls)),
    url(r'^whav/', include(whav_source.urls)),
    url(r'^upload/', include(upload_source.urls))
]

urlpatterns = [
    url('^$', start, name='api_root'),
    url(r'^ingest/', include((ingest_urls, 'ingest'))),
    url(r'^sources/', include(source_patterns)),
    url(r'^hav/', include(
        (hav_urls('hav'), app_name),
        namespace='hav_browser')
    )
]
