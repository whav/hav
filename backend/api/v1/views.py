from rest_framework.generics import ListCreateAPIView

from .serializers import FileIngestionSerializer
from .permissions import IncomingBaseMixin
from incoming.models import FileIngestSelection

class IngestView(IncomingBaseMixin, ListCreateAPIView):

    serializer_class = FileIngestionSerializer

    def get_queryset(self):
        return FileIngestSelection.objects.filter(created_by=self.request.user)


    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)




