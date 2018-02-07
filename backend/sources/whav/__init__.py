from django.conf.urls import url, include
from .api.views import WHAVCollectionBrowser, WHAVMediaDetail
from django.urls import path
from .. import Source

class WHAVSource(Source):

    @property
    def urls(self):
        return [
            path('', WHAVCollectionBrowser.as_view(), name='whav_root'),
            path(
                '<int:collection_id>/',
                WHAVCollectionBrowser.as_view(),
                name='whav_collection'
            ),
            path(
                'media/<int:mediaordering_id>/',
                WHAVMediaDetail.as_view(),
                name='whav_media'
            )
        ]