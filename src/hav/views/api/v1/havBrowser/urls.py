from django.urls import include, path

from .views import HAVMediaView, HAVNodeBrowser


def hav_urls(identifier):
    keys = [identifier]
    return [
        path("", HAVNodeBrowser.as_view(keys=keys), name="hav_root"),
        path("<int:pk>/", HAVNodeBrowser.as_view(keys=keys), name="hav_set"),
        path("media/<int:pk>/", HAVMediaView.as_view(keys=keys), name="hav_media"),
    ]
