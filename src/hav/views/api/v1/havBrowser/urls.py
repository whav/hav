from django.urls import include, path, re_path

from .views import HAVMediaView, HAVNodeBrowser


def hav_urls(identifier):
    keys = [identifier]
    return [
        path("", HAVNodeBrowser.as_view(keys=keys), name="hav_root"),
        re_path(r"^(?P<pk>\d+)/$", HAVNodeBrowser.as_view(keys=keys), name="hav_set"),
        re_path(
            r"^media/(?P<pk>\d+)/$", HAVMediaView.as_view(keys=keys), name="hav_media"
        ),
    ]
