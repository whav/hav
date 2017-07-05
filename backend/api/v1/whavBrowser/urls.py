from django.conf.urls import url, include
from .views import WHAVCollectionBrowser, WHAVMediaDetail

def whav_urls(identifier):
    keys = [identifier]
    return [
        url(r'^$', WHAVCollectionBrowser.as_view(keys=keys), name='whav_root'),
        url(
            r'^(?P<collection_id>\d+)/$',
            WHAVCollectionBrowser.as_view(keys=keys),
            name='whav_collection'
        ),
        url(
            r'^media/(?P<mediaordering_pk>\d+)/$',
            WHAVMediaDetail.as_view(keys=keys),
            name='whav_media'
        )
]