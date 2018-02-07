from django.conf.urls import url
from django.urls import path
from .views import FileBrowser
from hav.utils.sources import register


def fs_urls(root_path, identifier):
    register(root_path)
    return [
        path('', FileBrowser.as_view(root=root_path, identifier=identifier), name='filebrowser_root'),
        path(
            '<str:path>/',
            FileBrowser.as_view(root=root_path, identifier=identifier), name='filebrowser'
        )
    ]