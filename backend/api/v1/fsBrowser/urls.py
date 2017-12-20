from django.conf.urls import url
from .views import FileBrowser, FileBrowserFileDetail
from hav.utils.sources import register


def fs_urls(root_path, identifier):
    register(root_path)
    return [
        url(
            r'^(?P<path>.*)?/?$',
            FileBrowser.as_view(root=root_path, identifier=identifier), name='filebrowser'
        ),
        url(
            r'^(?P<path>((?:[^/]*/)*)(.*))?$',
            FileBrowserFileDetail.as_view(root=root_path, identifier=identifier),
            name='filebrowser_file'
        ),
    ]