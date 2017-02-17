from django.conf.urls import url
from .views import FileBrowser, FileBrowserFile


def fs_urls(root_path):
    return [
    url(
        r'^(?P<path>.*/)?$',
        FileBrowser.as_view(root=root_path), name='filebrowser'
    ),
    url(
        r'^(?P<path>.*/)?(?P<filename>(?:$|(.+?)(?:(\.[^.]*$)|$)))',
        FileBrowserFile.as_view(root=root_path),
        name='filebrowser_file'
    ),
]