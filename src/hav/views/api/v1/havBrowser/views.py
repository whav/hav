from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from hav.apps.media.models import Media
from hav.apps.sets.models import Node

from ..permissions import IncomingBaseMixin
from .serializers import (
    HAVMediaSerializer,
    HAVNodeSerializer,
    RootHAVCollectionSerializer,
)


class HAVMediaView(IncomingBaseMixin, RetrieveAPIView):
    queryset = Media.objects.all()
    serializer_class = HAVMediaSerializer

    keys = []


class HAVNodeBrowser(IncomingBaseMixin, APIView):

    _node = None
    keys = []

    @property
    def node(self):

        if not self._node and self.kwargs.get("pk"):
            self._node = Node.objects.get(pk=self.kwargs["pk"])
        return self._node

    def get_context(self):
        return {"request": self.request, "keys": self.keys, "parent_node": self.node}

    def get_serializer_class(self):
        if self.node:
            return HAVNodeSerializer
        else:
            return RootHAVCollectionSerializer

    def get(self, *args, **kwargs):
        sc = self.get_serializer_class()
        serializer = sc(
            # any truthy object will do if there is no node
            instance=self.node or object(),
            context=self.get_context(),
        )
        return Response(serializer.data)

    def post(self, request, pk=None):
        if not pk:
            return Response("Cannot create root nodes", status=400)
        sc = self.get_serializer_class()
        serializer = sc(data=request.data, context=self.get_context())
        serializer.is_valid(raise_exception=True)

        instance = serializer.create(serializer.validated_data)
        serializer = sc(instance=instance, context=self.get_context())

        return Response(serializer.data, status=201)

    def put(self, request, *args, **kwargs):
        sc = self.get_serializer_class()
        serializer = sc(
            data=request.data, instance=self.node, context=self.get_context()
        )
        serializer.is_valid(raise_exception=True)
        serializer.update(self.node, serializer.validated_data)
        return Response(serializer.data, status=200)
