from django.conf.urls import url
from .views import FileBrowser, FileBrowserFile


def fs_urls(root_path, identifier):
    keys = [identifier]
    return [
    url(
        r'^(?P<path>.*/)?$',
        FileBrowser.as_view(root=root_path, keys=keys), name='filebrowser'
    ),
    url(
        r'^(?P<path>.*/)?(?P<filename>(?:$|(.+?)(?:(\.[^.]*$)|$)))',
        FileBrowserFile.as_view(root=root_path, keys=keys),
        name='filebrowser_file'
    ),
]