from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response
from django.http import Http404
from apps.whav.models import ImageCollection, MediaOrdering
from ...permissions import IncomingBaseMixin
from .serializers import WHAVCollectionSerializer, RootWHAVCollectionSerializer, WHAVFileSerializer


class BaseWHAVBrowser(IncomingBaseMixin):

    source_config = None

    @property
    def context(self):
        return {
            'request': self.request,
            'source_config': self.source_config
        }


class WHAVCollectionBrowser(BaseWHAVBrowser, APIView):

    def get(self, request, collection_id=None):
        image_collection = object()
        serializer_class = RootWHAVCollectionSerializer
        if collection_id:
            try:
                image_collection = ImageCollection.objects.get(pk=collection_id)
                serializer_class = WHAVCollectionSerializer
            except ImageCollection.DoesNotExist:
                raise Http404()

        serializer = serializer_class(
            # any truthy object will do if there is no imagecollection
            instance=image_collection,
            context=self.context
        )
        return Response(serializer.data)


class WHAVMediaDetail(BaseWHAVBrowser, RetrieveAPIView):

    queryset = MediaOrdering.objects.all()
    lookup_url_kwarg = 'mediaordering_id'
    serializer_class = WHAVFileSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx.update(self.context)
        return ctx




