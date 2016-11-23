from rest_framework.generics import CreateAPIView, RetrieveAPIView, ListCreateAPIView
from rest_framework.permissions import IsAdminUser

from .serializers import UploadSerializer, FolderSerializer
from .models import UploadedFileFolder


class IncomingBaseMixin(object):
    permission_classes = (IsAdminUser,)


class RootFolderAPIView(IncomingBaseMixin, ListCreateAPIView):

    serializer_class = FolderSerializer

    def get_queryset(self):
        return UploadedFileFolder.get_root_nodes()



class FolderAPIView(IncomingBaseMixin, RetrieveAPIView):

    serializer_class = FolderSerializer
    queryset = UploadedFileFolder.objects.all()



class UploadedFileCreateView(IncomingBaseMixin, CreateAPIView):
    serializer_class = UploadSerializer

    def perform_create(self, serializer):
        serializer.save(uploader=self.request.user)
