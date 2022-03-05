from django.http import Http404

from rest_framework.generics import ListAPIView, RetrieveAPIView
from hav.apps.hav_collections.models import Collection
from hav.apps.sets.models import Node
from hav.apps.media.models import Media

from .serializers import CollectionSerializer, NodeSerializer, MediaSerializer


class CollectionListView(ListAPIView):
    serializer_class = CollectionSerializer

    def get_queryset(self):
        return Collection.objects.all().order_by("root_node__numchild")


class NodeView(RetrieveAPIView):
    serializer_class = NodeSerializer
    lookup_url_kwarg = "node_id"

    def get_queryset(self):
        return Node.objects.all()


class MediaView(RetrieveAPIView):
    serializer_class = MediaSerializer
    lookup_url_kwarg = "media_id"

    queryset = Media.objects.all()

    def get_object(self):
        media: Media = super().get_object()
        if media.is_public:
            return media
        raise Http404("Non-public media not returned via API.")
