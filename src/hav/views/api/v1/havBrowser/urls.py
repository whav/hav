from django.urls import path, re_path, include
from .views import HAVNodeBrowser, HAVMediaView


def hav_urls(identifier):
    keys = [identifier]
    return [
        path("", HAVNodeBrowser.as_view(keys=keys), name="hav_root"),
        re_path(r"^(?P<pk>\d+)/$", HAVNodeBrowser.as_view(keys=keys), name="hav_set"),
        re_path(
            r"^media/(?P<pk>\d+)/$", HAVMediaView.as_view(keys=keys), name="hav_media"
        ),
    ]
