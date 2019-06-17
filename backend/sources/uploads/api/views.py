from pathlib import Path

from django.core.files.storage import FileSystemStorage
from rest_framework.views import APIView
from rest_framework.parsers import FileUploadParser
from rest_framework import serializers
from rest_framework.response import Response

from ...permissions import IncomingBaseMixin
from sources.uploads.models import FileUpload

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileUpload


class FileUploadView(IncomingBaseMixin, APIView):

    source_config = None
    parser_classes = [FileUploadParser]

    def save_file(self, file, path, mode='xb'):

        assert(isinstance(path, Path))
        # convert to relative if needed
        if path.is_absolute():
            path = path.relative_to(self.root_path)

        storage = FileSystemStorage(location=self.root_path)
        try:
            with storage.open(storage.get_available_name(path), mode) as destination:
                for chunk in file.chunks():
                    destination.write(chunk)
        except OSError as err:
            raise FileOperationException(
                detail='{0} {1}'.format(
                    FileOperationException.default_detail,
                    err
                )
            )

        return path

    def get(self, request):
        serializer = FileSerializer(FileUpload.objects.filter(created_by=self.request.user), many=True)
        return Response(data=serializer.data)

    def put(self, request, path=None, filename=None, **kwargs):
        file = request.data['file']
        # get an absolute path to the file to be created
        path = self.resolve_directory(path).joinpath(filename)
        self.save_file(file, path)
        serializer = FileSerializer(
            instance=path,
            context=self.context
        )
        return Response(data=serializer.data, status=201)
