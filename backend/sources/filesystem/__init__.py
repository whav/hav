from django.core.exceptions import ImproperlyConfigured
from django.urls import path, reverse, re_path
import os
from pathlib import Path
from .. import Source
from .utils import encodePath, decodePath
from .api.views import FileBrowser, FileBrowserFileUpload

import logging

logger = logging.getLogger(__name__)


class FSSource(Source):

    def __init__(self, root, source_id):
        if not os.path.exists(root):
            raise ImproperlyConfigured("Unable to locate directory at %s" % str(root))
        self.root = root
        self.source_id = source_id
        self.root_path = Path(root)
        logger.debug(
            'Initialized Source %s with root %s and source identifier %s' %
            (self.__class__.__name__, self.root, self.source_id)
        )

    def to_fs_path(self, path=None):
        if path:
            fs_path = self.root_path / Path(decodePath(path))
        else:
            fs_path = self.root_path

        logger.debug('Resolved hash %s to absolute path: %s' % (path, fs_path))
        return fs_path

    def to_url_path(self, path=None):
        if path and path.is_absolute() and path != self.root_path:
            path = path.relative_to(self.root_path)
            return encodePath(str(path))
        return ''

    def to_url(self, path, request):
        match = request._request.resolver_match
        namespaces = list(match.namespaces)

        if path == self.root_path:
            namespaces.append('filebrowser_root')
            rel_url = reverse(':'.join(namespaces))
        else:
            namespaces.append('filebrowser')
            rel_url = reverse(':'.join(namespaces), kwargs={'path': self.to_url_path(path)})

        return request.build_absolute_uri(rel_url)

    @property
    def urls(self):
        kwargs = {
            'source_config': self,
        }
        return [
            path('', FileBrowser.as_view(**kwargs), name='filebrowser_root'),
            # re_path(
            #     r'(?P<path>\w+\/$)?(?P<filename>[\w.]+)$',
            #     FileBrowserFileUpload.as_view(**kwargs),
            #     name='filebrowser_upload'
            # ),
            path('<str:filename>', FileBrowserFileUpload.as_view(**kwargs)),
            path('<str:path>/<str:filename>', FileBrowserFileUpload.as_view(**kwargs), name='filebrowser_upload'),
            path('<str:path>/', FileBrowser.as_view(**kwargs), name='filebrowser'),

        ]
