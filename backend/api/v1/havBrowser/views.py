from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import Http404

from hav.sets.models import Node
from ..permissions import IncomingBaseMixin
from .serializers import HAVNodeSerializer, RootHAVCollectionSerializer, CreateHAVCollectionSerializer


class HAVNodeBrowser(IncomingBaseMixin, APIView):

    node = None
    keys = []

    def get_context(self):
        return {
            'request': self.request,
            'keys': self.keys
        }

    def get_serializer_class(self):
        if self.node:
            return HAVNodeSerializer
        else:
            return RootHAVCollectionSerializer

    def get(self, request, node_id=None):

        if node_id:
            try:
                self.node = Node.objects.get(pk=node_id)
            except Node.DoesNotExist:
                raise Http404()

        sc = self.get_serializer_class()
        serializer = sc(
            # any truthy object will do if there is no node
            instance=self.node or object(),
            context=self.get_context()
        )
        return Response(serializer.data)

    def post(self, request, node_id=None):

        if node_id:
            try:
                self.node = Node.objects.get(pk=node_id)
            except Node.DoesNotExist:
                raise Http404()

        serializer = CreateHAVCollectionSerializer(
            data=request.data,
            instance=self.node or object(),
            context=self.get_context()
        )

        if serializer.is_valid():
            node = serializer.create(serializer.validated_data, parent=self.node)
            return Response({}, status=201)
        else:
            print(serializer.errors)










