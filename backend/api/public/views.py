from rest_framework.generics import ListAPIView, RetrieveAPIView
from apps.hav_collections.models import Collection
from apps.sets.models import Node
from apps.media.models import Media
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
