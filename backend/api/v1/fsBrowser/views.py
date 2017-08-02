import os
from pathlib import Path
from urllib.request import url2pathname

from django.http import Http404
from django.conf import settings

from django.core.files.storage import FileSystemStorage

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import FileUploadParser
from rest_framework.exceptions import APIException

from ..permissions import IncomingBaseMixin

from .serializers import FileSerializer, DirectorySerializer, BaseDirectorySerializer


class FileBrowserMixin(object):

    root = None
    scheme = 'file'
    identifier = None

    @property
    def context(self):
        return {
            'root': self.root_path,
            'request': self.request,
            'scheme': self.scheme,
            'identifier': self.identifier
        }

    @property
    def root_path(self):
        return Path(self.root).resolve()

    def resolve_directory(self, path):
        path = path or '/'
        parts = [url2pathname(p) for p in path.split('/')]
        absolute_path = os.path.join(self.root, *parts)
        path = Path(absolute_path).resolve()
        assert(path >= self.root_path)
        return path

    def build_absolute_path(self, path):
        absolute = os.path.join(self.root, path)
        return os.path.normpath(absolute)


class FileBrowser(IncomingBaseMixin, FileBrowserMixin, APIView):

    def get(self, request, path=None, **kwargs):
        path = self.resolve_directory(path)

        try:
            assert(path.is_dir())
            assert(os.access(os.fspath(path), os.R_OK))
        except (FileNotFoundError, AssertionError):
            raise Http404()

        serializer = DirectorySerializer(
            instance=path,
            context=self.context
        )
        return Response(serializer.data)


class FileOperationException(APIException):
    default_detail = 'The file operation you have requested could not be completed.'
    default_code = 'file_handling_error'



class FileBrowserFileDetail(IncomingBaseMixin, FileBrowserMixin, APIView):

    def get(self, request, path=None, **kwargs):
        path = self.resolve_directory(path)
        try:
            assert(path.is_file())
            assert(os.access(path, os.R_OK))
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

        storage = FileSystemStorage(location=self.root)
        try:
            with storage.open(path, mode) as destination:
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
