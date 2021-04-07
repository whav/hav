from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework import serializers
from apps.hav_collections.models import Collection
from apps.sets.models import Node
from .serializers import CollectionSerializer, NodeSerializer


class CollectionListView(ListAPIView):
    serializer_class = CollectionSerializer

    def get_queryset(self):
        return Collection.objects.all().order_by("root_node__numchild")


class NodeView(RetrieveAPIView):
    serializer_class = NodeSerializer
    lookup_url_kwarg = "node_id"

    def get_queryset(self):
        return Node.objects.all()
