from rest_framework.generics import CreateAPIView

from .serializers import FileIngestionSerializer
from .permissions import IncomingBaseMixin


class IngestView(IncomingBaseMixin, CreateAPIView):

    serializer_class = FileIngestionSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)




