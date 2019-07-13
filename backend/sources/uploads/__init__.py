from django.core.exceptions import ImproperlyConfigured
from django.urls import path, reverse
import os

from pathlib import Path
from .. import Source

import logging

logger = logging.getLogger(__name__)


class UploadSource(Source):

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
        kwargs = {
            'source_config': self,
        }
        from .api.views import FileUploadView
        return [
            path('', FileUploadView.as_view(**kwargs), name='fileupload'),
            path('<str:filename>', FileUploadView.as_view(**kwargs), name='fileupload_detail')
        ]
