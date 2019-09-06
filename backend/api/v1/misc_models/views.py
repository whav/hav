from rest_framework import generics
from rest_framework import filters, pagination
from ..permissions import IncomingBaseMixin

from .serializers import MediaCreatorSerializer, MediaLicenseSerializer, MediaCreatorRoleSerializer, TagSerializer
from apps.media.models import MediaCreator, License, MediaCreatorRole
from apps.tags.models import find_tags, Tag


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


class TagAutocompleteView(IncomingBaseMixin, generics.ListAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    pagination_class = TagAutompletePagination

    def get_queryset(self):
        # default is empty
        qs = Tag.objects.none()
        query = self.request.query_params.get('search', '').strip()
        if query:
            qs = Tag.objects.filter(name__icontains=query).select_subclasses()
        return qs







