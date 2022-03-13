import logging

from django.http import HttpResponseForbidden
from rest_framework import generics
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from hav.apps.media.models import License, MediaCreator, MediaCreatorRole
from hav.apps.tags.models import Tag, search_tags

from ..permissions import IncomingBaseMixin, has_collection_permission
from .serializers import (
    MediaCreatorRoleSerializer,
    MediaCreatorSerializer,
    MediaLicenseSerializer,
    SimpleTagSerializer,
)

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

    def post(self, request):
        tag_serializer = SimpleTagSerializer(
            data=request.data, context={"user": request.user}
        )
        tag_serializer.is_valid(raise_exception=True)
        collection = tag_serializer.get_collection()
        if has_collection_permission(request.user, collection):
            tag = tag_serializer.save()
            return Response(SimpleTagSerializer(instance=tag).data, status=201)
        else:
            return HttpResponseForbidden()
