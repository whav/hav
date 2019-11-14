from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from ..permissions import IncomingBaseMixin, has_collection_permission
import logging


from .serializers import (
    MediaCreatorSerializer,
    MediaLicenseSerializer,
    MediaCreatorRoleSerializer,
)
from apps.media.models import MediaCreator, License, MediaCreatorRole
from apps.tags.models import Tag, search_tags

logger = logging.getLogger(__name__)


class MediaCreatorAPI(IncomingBaseMixin, generics.ListCreateAPIView):
    queryset = MediaCreator.objects.all()
    serializer_class = MediaCreatorSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class MediaLicenseAPI(IncomingBaseMixin, generics.ListAPIView):
    queryset = License.objects.all()
    serializer_class = MediaLicenseSerializer


class MediaCreatorRoleAPI(IncomingBaseMixin, generics.ListAPIView):
    queryset = MediaCreatorRole.objects.all()
    serializer_class = MediaCreatorRoleSerializer


class TagAutocompleteView(IncomingBaseMixin, APIView):
    def get(self, request, *args, **kwargs):
        query = request.query_params.get("search", "").strip()
        logger.debug(f"Searching for tags by query: {query}")
        results = []
        if len(query) >= 3:
            collection = request.query_params.get("collection")
            results = search_tags(query, collection)
            logger.info(f"Query for {query} yielded {len(results)} results")
            results = [r.__dict__ for r in results]
        return Response(results, status=200)
