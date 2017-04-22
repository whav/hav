from rest_framework.generics import CreateAPIView, ListCreateAPIView
from rest_framework.parsers import FileUploadParser
from rest_framework.views import APIView, Response

from .serializers import UploadSerializer, FolderSerializer
from .permissions import IncomingBaseMixin
from incoming.models import UploadedFileFolder


class RootFolderAPIView(IncomingBaseMixin, ListCreateAPIView):

    serializer_class = FolderSerializer

    def get_queryset(self):
        return UploadedFileFolder.get_root_nodes()


class UploadedFileCreateView(IncomingBaseMixin, CreateAPIView):
    serializer_class = UploadSerializer
    parser_classes = (FileUploadParser,)

    def perform_create(self, serializer):
        serializer.save(uploader=self.request.user)


class IngestView(IncomingBaseMixin, APIView):

    def post(self, request, **kwargs):
        import ipdb; ipdb.set_trace()
        return Response({}, status=201)



