from django.conf.urls import url, include
from django.conf import settings
from .views import IngestView
from .fsBrowser.urls import fs_urls
from .whavBrowser.urls import whav_urls

urlpatterns = [
    url(r'^ingest/$', IngestView.as_view(), name='ingest'),
    url(r'^incoming/', include(fs_urls(settings.MEDIA_ROOT, 'media_browser'), namespace='fs_browser')),
    url(r'^whav/', include(whav_urls('whav'), namespace='whav_browser'))
]
