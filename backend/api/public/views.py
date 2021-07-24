from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework import serializers
from apps.hav_collections.models import Collection
from apps.sets.models import Node
from apps.media.models import Media
from django.shortcuts import get_object_or_404
from .serializers import CollectionSerializer, NodeSerializer, NodeLinkSerializer


class CollectionListView(ListAPIView):
    serializer_class = CollectionSerializer

    def get_queryset(self):
        return Collection.objects.all().order_by("root_node__numchild")


class NodeView(RetrieveAPIView):
    serializer_class = NodeSerializer
    lookup_url_kwarg = "node_id"

    def get_queryset(self):
        return Node.objects.all()


class NodeWidgetView(RetrieveAPIView):

    serializer_class = NodeLinkSerializer
    queryset = Node.objects.all()
    lookup_url_kwarg = "node_id"

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        if "media" in self.request.GET:
            media = get_object_or_404(Media, pk=self.request.GET["media"])
        else:
            media = self.get_object().get_representative_media()
        ctx.update({"media": media})
        return ctx
