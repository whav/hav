from django.conf.urls import url, include
from .views import WHAVCollectionBrowser

def whav_urls(identifier):
    keys = [identifier]
    return [
        url(r'^$', WHAVCollectionBrowser.as_view(keys=keys), name='whav_root'),
        url(
            r'(?P<collection_id>\d+)/$',
            WHAVCollectionBrowser.as_view(keys=keys),
            name='whav_collection'
        )
]