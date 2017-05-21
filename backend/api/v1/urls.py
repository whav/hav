from django.conf.urls import url, include
from django.conf import settings

from .views import IngestView
from .fsBrowser.urls import fs_urls
from .whavBrowser.urls import whav_urls
from .havBrowser.urls import hav_urls

from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.reverse import reverse

@api_view(['GET'])
def start(request):
    return Response(
        {
            "hav": reverse('api:v1:hav_browser:hav_root', request=request)
        }
    )

urlpatterns = [
    url('^$', start),
    url(r'^ingest/$', IngestView.as_view(), name='ingest'),
    url(r'^incoming/', include(fs_urls(settings.MEDIA_ROOT, 'media_browser'), namespace='fs_browser')),
    url(r'^whav/', include(whav_urls('whav'), namespace='whav_browser')),
    url(r'^hav/', include(hav_urls('hav'), namespace='hav_browser'))
]
