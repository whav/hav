from rest_framework import generics
from ..permissions import IncomingBaseMixin

from .serializers import MediaCreatorSerializer
from apps.media.models import MediaCreator


class MediaCreatorAPI(IncomingBaseMixin, generics.ListCreateAPIView):
    queryset = MediaCreator.objects.all()
    serializer_class = MediaCreatorSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)



