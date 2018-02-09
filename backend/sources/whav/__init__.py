from django.urls import path, reverse
from apps.whav.models import ImageCollection, MediaOrdering
from .api.views import WHAVCollectionBrowser, WHAVMediaDetail
from .. import Source

class WHAVSource(Source):

    def to_url(self, obj=None, request=None):
        namespaces = list(request._request.match.namespaces) if request else []
        kwargs = {}

        if not obj:
            namespaces.append('whav_root')
        elif isinstance(obj, ImageCollection):
            namespaces.append('whav_collection')
            kwargs = {
                'collection_id': obj.pk
            }
        elif isinstance(obj, MediaOrdering):
            namespaces.append('whav_media')
            kwargs = {
                'mediaordering_id': obj.pk
            }

        url = reverse(':'.join(namespaces), kwargs=kwargs)

        if request:
            return request.build_absolute_uri(url)

        return url

    @property
    def urls(self):
        kwargs = {
            'source_config': self,
        }
        return [
            path('', WHAVCollectionBrowser.as_view(**kwargs), name='whav_root'),
            path(
                '<int:collection_id>/',
                WHAVCollectionBrowser.as_view(**kwargs),
                name='whav_collection'
            ),
            path(
                'media/<int:mediaordering_id>/',
                WHAVMediaDetail.as_view(**kwargs),
                name='whav_media'
            )
        ]