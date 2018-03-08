from django.conf.urls import url, include
from .views import HAVNodeBrowser, HAVMediaView

def hav_urls(identifier):
    keys = [identifier]
    return [
        url(r'^$', HAVNodeBrowser.as_view(keys=keys), name='hav_root'),
        url(
            r'^(?P<pk>\d+)/$',
            HAVNodeBrowser.as_view(keys=keys),
            name='hav_set'
        ),
        url(
            r'^media/(?P<pk>\d+)/$',
            HAVMediaView.as_view(keys=keys),
            name='hav_media'
        )
]