from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import Http404

from whav.models import ImageCollection
from ..permissions import IncomingBaseMixin
from .serializers import WHAVCollectionSerializer, RootWHAVCollectionSerializer


class WHAVCollectionBrowser(IncomingBaseMixin, APIView):

    ic = None
    keys = []

    def get_context(self):
        return {
            'request': self.request,
            'keys': self.keys
        }

    def get_serializer_class(self):
        if self.ic:
            return WHAVCollectionSerializer
        else:
            return RootWHAVCollectionSerializer

    def get(self, request, collection_id=None):

        if collection_id:
            try:
                self.ic = ImageCollection.objects.get(pk=collection_id)
            except ImageCollection.DoesNotExist:
                raise Http404()

        sc = self.get_serializer_class()
        serializer = sc(
            # any truthy object will do if there is no imagecollection
            instance=self.ic or object(),
            context=self.get_context()
        )
        return Response(serializer.data)






