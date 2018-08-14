import os
from pathlib import Path
from django.http import Http404

from django.core.files.storage import FileSystemStorage

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import FileUploadParser
from rest_framework.exceptions import APIException

from ...permissions import IncomingBaseMixin

from .serializers import FileSerializer, DirectorySerializer


class FileBrowserMixin(object):

    source_config = None

    @property
    def context(self):
        return {
            'source_config': self.source_config,
            'request': self.request,
        }

    @property
    def root_path(self):
        return Path(self.source_config.root).resolve()

    def resolve_directory(self, path):
        return self.source_config.to_fs_path(path)

    def build_absolute_path(self, path):
        return self.source_config.to_fs_path(path)


class FileBrowser(IncomingBaseMixin, FileBrowserMixin, APIView):

    def get(self, request, path=None, **kwargs):
        path = self.source_config.to_fs_path(path)

        if path.is_file():
            serializer = FileSerializer(
                instance=path,
                context=self.context
            )
        elif path.is_dir():
            serializer = DirectorySerializer(
                instance=path,
                context=self.context
            )
        else:
            raise Http404('File or directory not found.')

        if not os.access(str(path), os.R_OK):
            raise Http404('Incorrect permissions.')

        return Response(serializer.data)


class FileOperationException(APIException):
    default_detail = 'The file operation you have requested could not be completed.'
    default_code = 'file_handling_error'


class FileBrowserFileDetail(IncomingBaseMixin, FileBrowserMixin, APIView):

    def get(self, request, path=None, **kwargs):

        path = self.resolve_directory(path)
        try:
            assert(path.is_file())
            assert(os.access(str(path), os.R_OK))
        except (FileNotFoundError, AssertionError):
            raise Http404()
        serializer = FileSerializer(
            instance=path,
            context=self.context
        )
        return Response(serializer.data)

    def put(self, request, path=None, **kwargs):
        filename = self.resolve_directory(path).name
        view = FileBrowserFileUpload.as_view(root=self.root)
        return view(
            request,
            path=path[0:-len(filename)],
            filename=filename,
            **kwargs
        )



class FileBrowserFileUpload(IncomingBaseMixin, FileBrowserMixin, APIView):

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
