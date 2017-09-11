from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response
from django.http import Http404
from django.shortcuts import get_object_or_404
from apps.whav.models import ImageCollection, MediaOrdering
from ..permissions import IncomingBaseMixin
from .serializers import WHAVCollectionSerializer, RootWHAVCollectionSerializer, WHAVFileSerializer


class BaseWHAVBrowser(IncomingBaseMixin):

    scheme = 'whav'
    identifier = None

    @property
    def context(self):
        return {
            'request': self.request,
            'scheme': self.scheme,
            'identifier': self.identifier
        }


class WHAVCollectionBrowser(BaseWHAVBrowser, APIView):

    image_collection = None

    def get_serializer_class(self):
        if self.image_collection:
            return WHAVCollectionSerializer
        else:
            return RootWHAVCollectionSerializer

    def get(self, request, collection_id=None):

        if collection_id:
            self.identifier = collection_id
            try:
                self.image_collection = ImageCollection.objects.get(pk=collection_id)
            except ImageCollection.DoesNotExist:
                raise Http404()

        sc = self.get_serializer_class()
        serializer = sc(
            # any truthy object will do if there is no imagecollection
            instance=self.image_collection or object(),
            context=self.context
        )
        return Response(serializer.data)


class WHAVMediaDetail(BaseWHAVBrowser, RetrieveAPIView):

    queryset = MediaOrdering.objects.all()
    serializer_class = WHAVFileSerializer

    def get_object(self):
        queryset = self.get_queryset()
        return get_object_or_404(
            queryset,
            collection=self.kwargs.get('collection_id'),
            media=self.kwargs.get('media_id')
        )

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx.update(self.context)
        return ctx

    def get(self,  *args, **kwargs):
        self.identifier = kwargs.get(self.lookup_url_kwarg)
        return super().get(*args, **kwargs)




