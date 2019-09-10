from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework import filters, pagination
from ..permissions import IncomingBaseMixin, has_collection_permission

from .serializers import MediaCreatorSerializer, MediaLicenseSerializer, MediaCreatorRoleSerializer, TagSerializer, CollectionTagSerializer
from apps.media.models import MediaCreator, License, MediaCreatorRole
from apps.tags.models import Tag, CollectionTag, ManagedTag


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


class TagAutompletePagination(pagination.CursorPagination):
    page_size = 100
    ordering = 'name'


class TagAutocompleteView(IncomingBaseMixin, APIView):

    def get(self, request, *args, **kwargs):
        qs = Tag.objects.none()
        query = request.query_params.get('search', '').strip()
        collection = request.query_params.get('collection')
        if query and not collection:
            qs = ManagedTag.objects.filter(name__icontains=query)
        elif query and collection:
            if not has_collection_permission(request.user, collection):
                raise ValidationError(f'Permission denied for collection {collection}.')
            qs = Tag.objects.filter(name__icontains=query).select_subclasses(ManagedTag, CollectionTag)
        return Response(TagSerializer(instance=qs, many=True).data, status=200)

    def post(self, request, *args, **kwargs):
        # TODO: check for collection permissions
        serializer = CollectionTagSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        collection = serializer.validated_data['collection']
        perms = has_collection_permission(request.user, collection)
        if not perms:
            raise ValidationError(f'Permission denied for collection {collection.name}')

        tag = serializer.save()
        return Response(TagSerializer(instance=tag).data, status=201)






