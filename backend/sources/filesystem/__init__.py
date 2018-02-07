from django.core.exceptions import ImproperlyConfigured
from django.urls import path
import os
from pathlib import Path
from .. import Source
from .api.views import FileBrowser

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

    @property
    def urls(self):
        return [
            path('', FileBrowser.as_view(root=self.root_path), name='filebrowser_root'),
            path('<str:path>/', FileBrowser.as_view(root=self.root_path), name='filebrowser')
        ]
