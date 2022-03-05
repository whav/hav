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
            "Initialized Source %s with root %s and source identifier %s"
            % (self.__class__.__name__, self.root, self.source_id)
        )

    def to_fs_path(self, pk=None):
        from .models import FileUpload

        if pk:
            upload = FileUpload.objects.get(pk=pk)
            fs_path = self.root_path / Path(upload.file.name)
        else:
            fs_path = self.root_path

        logger.debug("Resolved %s to absolute path: %s" % (pk, fs_path))
        return fs_path

    def to_url_path(self, path=None):
        if not path:
            return ""
        if path.is_absolute() and path != self.root_path:
            path = path.relative_to(self.root_path)
        return str(path)

    def to_url(self, pk, request):
        match = request._request.resolver_match
        namespaces = list(match.namespaces)
        namespaces.append("fileupload_detail")
        rel_url = reverse(":".join(namespaces), kwargs={"pk": pk})

        return request.build_absolute_uri(rel_url)

    @property
    def urls(self):
        kwargs = {
            "source_config": self,
        }
        from .api.views import FileUploadView, FileDetailView

        return [
            path("", FileUploadView.as_view(**kwargs), name="fileupload"),
            path(
                "<int:pk>/", FileDetailView.as_view(**kwargs), name="fileupload_detail"
            ),
            path(
                "<path:filename>",
                FileDetailView.as_view(**kwargs),
                name="fileupload_upload",
            ),
        ]
