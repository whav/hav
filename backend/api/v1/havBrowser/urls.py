from django.conf.urls import url, include
from .views import HAVNodeBrowser

def hav_urls(identifier):
    keys = [identifier]
    return [
        url(r'^$', HAVNodeBrowser.as_view(keys=keys), name='hav_root'),
        url(
            r'(?P<node_id>\d+)/$',
            HAVNodeBrowser.as_view(keys=keys),
            name='hav_set'
        )
]