import os
from django.conf import settings
from django.urls import path, reverse
from apps.whav.models import ImageCollection, MediaOrdering
from .api.views import WHAVCollectionBrowser, WHAVMediaDetail
from .. import Source

import logging

logger = logging.getLogger(__name__)


class WHAVSource(Source):
    def to_fs_path(self, *args, **kwargs):
        if "mediaordering_id" in kwargs:
            mo = (
                MediaOrdering.objects.filter(pk=kwargs["mediaordering_id"])
                .select_related("media")
                .first()
            )
            return os.path.join(settings.WHAV_ARCHIVE_PATH, mo.media.localfile.path)
        return None

    def to_url(self, obj=None, request=None):
        namespaces = list(request._request.resolver_match.namespaces) if request else []
        kwargs = {}

        if not obj:
            namespaces.append("whav_root")
        elif isinstance(obj, ImageCollection):
            namespaces.append("whav_collection")
            kwargs = {"collection_id": obj.pk}
        elif isinstance(obj, MediaOrdering):
            namespaces.append("whav_media")
            kwargs = {"mediaordering_id": obj.pk}

        url = reverse(":".join(namespaces), kwargs=kwargs)

        if request:
            return request.build_absolute_uri(url)

        return url

    @property
    def urls(self):
        kwargs = {
            "source_config": self,
        }
        return [
            path("", WHAVCollectionBrowser.as_view(**kwargs), name="whav_root"),
            path(
                "<int:collection_id>/",
                WHAVCollectionBrowser.as_view(**kwargs),
                name="whav_collection",
            ),
            path(
                "media/<int:mediaordering_id>/",
                WHAVMediaDetail.as_view(**kwargs),
                name="whav_media",
            ),
        ]
