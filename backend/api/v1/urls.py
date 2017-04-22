from django.conf.urls import url, include
from django.conf import settings
from .views import UploadedFileCreateView, IngestView
from .fsBrowser.urls import fs_urls
from .whavBrowser.urls import urlpatterns as whav_urls

urlpatterns = [
    url(r'^upload/$', UploadedFileCreateView.as_view(), name='upload'),
    url(r'^ingest/$', IngestView.as_view(), name='ingest'),
    url(r'^incoming/', include(fs_urls(settings.MEDIA_ROOT), namespace='fs_browser')),
    url(r'^whav/', include(whav_urls, namespace='whav_browser'))
]
