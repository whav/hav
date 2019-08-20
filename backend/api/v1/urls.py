from django.conf import settings
from django.conf.urls import url, include
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse as django_reverse

from sources.filesystem import FSSource
from sources.whav import WHAVSource
from sources.uploads import UploadSource

from .havBrowser.urls import hav_urls
from .ingest.urls import ingest_urls

from .misc_models.urls import urlpatterns as model_url_patterns

# TODO: this is a duplication of the sources defined in settings.py
incoming_fss_source = FSSource(settings.INCOMING_FILES_ROOT, source_id='incoming')
whav_source = WHAVSource()
upload_source = UploadSource(settings.MEDIA_ROOT, source_id='upload')

app_name = 'api'

@api_view(['GET'])
def start(request):

    def reverse(name):
        return django_reverse(f'api:v1:{name}', request=request)

    # build a structure for all patterns defined in misc models
    misc_models = {}
    for pattern in model_url_patterns:
        name = pattern.name
        misc_models.update({name: reverse(f'models:{name}')})

    return Response(
        {
            "hav": reverse('hav_browser:hav_root'),
            "sources": [
                {
                    "name": "Incoming",
                    "url": reverse('filebrowser_root')
                },
                {
                    "name": "WHAV",
                    "url": reverse("whav_root")
                },
                {
                    "name": "Uploads",
                    "url": reverse("fileupload")

                }
            ],
            "models": misc_models
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
    ),
    url(r'^models/', include((model_url_patterns, 'models')))
]
