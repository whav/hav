from django.conf.urls import url, include
from .views import WHAVCollectionBrowser

urlpatterns = [
    url(r'^$', WHAVCollectionBrowser.as_view(), name='whav_root'),
    url(
        r'(?P<collection_id>\d+)/$',
        WHAVCollectionBrowser.as_view(),
        name='whav_collection'
    )
]