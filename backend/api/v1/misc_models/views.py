from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from ..permissions import IncomingBaseMixin, has_collection_permission

from .serializers import (
    MediaCreatorSerializer,
    MediaLicenseSerializer,
    MediaCreatorRoleSerializer,
    TagSerializer,
    TagSearchSerializer,
)
from apps.media.models import MediaCreator, License, MediaCreatorRole
from apps.tags.models import Tag


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
        qs = Tag.objects.none()
        search_serializer = TagSearchSerializer(data=request.query_params)
        search_serializer.is_valid(raise_exception=True)
        query = search_serializer.validated_data["search"]
        collection = search_serializer.validated_data["collection"]

        if query:
            qs = Tag.objects.filter(name__icontains=query)

        if collection:
            if not has_collection_permission(request.user, collection):
                raise ValidationError(f"Permission denied for collection {collection}.")
            qs = qs.filter(collection=collection)

        # limit the results
        qs = qs[:30]
        return Response(TagSerializer(instance=qs, many=True).data, status=200)
