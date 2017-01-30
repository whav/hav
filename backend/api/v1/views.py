from django.utils import timezone

from rest_framework.generics import CreateAPIView, RetrieveAPIView, ListCreateAPIView
from rest_framework.parsers import FileUploadParser

from .serializers import UploadSerializer, FolderSerializer
from .permissions import IncomingBaseMixin
from incoming.models import UploadedFileFolder


class RootFolderAPIView(IncomingBaseMixin, ListCreateAPIView):

    serializer_class = FolderSerializer

    def get_queryset(self):
        return UploadedFileFolder.get_root_nodes()


class FolderAPIView(IncomingBaseMixin, RetrieveAPIView):

    serializer_class = FolderSerializer
    queryset = UploadedFileFolder.objects.all()


class UploadedFileCreateView(IncomingBaseMixin, CreateAPIView):
    serializer_class = UploadSerializer
    parser_classes = (FileUploadParser,)

    def perform_create(self, serializer):
        serializer.save(uploader=self.request.user)



