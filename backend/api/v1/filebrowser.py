import os
import stat
from pathlib import Path
from urllib.request import pathname2url, url2pathname
from mimetypes import guess_type

from django.http import Http404
from django.conf import settings
from django.utils.http import quote
from django.core.urlresolvers import reverse
from django.core.files.storage import FileSystemStorage

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import serializers
from rest_framework.parsers import FileUploadParser
from rest_framework.exceptions import APIException

from .permissions import IncomingBaseMixin

from libthumbor import CryptoURL

crypto = CryptoURL(settings.THUMBOR_SECURITY_KEY)


default_thumbnail_kwargs = {
    "height": 200,
    "smart": False,
    "fit_in": True
}


def thumbnail_url(image_path, **kwargs):

    for k, v in default_thumbnail_kwargs.items():
        kwargs.setdefault(k, v)

    return settings.THUMBOR_SERVER.strip('/') + crypto.generate(
        image_url=image_path,
        **kwargs
    )


class FileStatsSerializer(serializers.BaseSerializer):

    def to_representation(self, path):
        stats = path.stat()
        mode = stats.st_mode
        return {
            'isDirectory': stat.S_ISDIR(mode),
            'isRegularFile': stat.S_ISREG(mode),
            'size': stats.st_size,
            'read': os.access(path, os.R_OK),
            'write': os.access(path, os.W_OK),
            'execute': os.access(path, os.X_OK)
        }


class FileBrowserBaseSerializer(serializers.Serializer):

    name = serializers.SerializerMethodField()
    stat = FileStatsSerializer(source='*')

    def get_name(self, path):
        if path == self.get_root():
            return 'Root'
        return path.name

    # some methods that are used in subclasses
    def get_root(self):
        return self.context['root']

    def get_path(self, path):
        root = self.context.get('root')
        location = ''
        relative_path = path.relative_to(root)
        parts = relative_path.parts

        if len(parts) > 0:
            suffix = '/' if relative_path.is_dir() else ''
            location = os.path.join(*parts, suffix)
            location = quote(location)

        return location

    def get_url_for_path(self, path):
        request = self.context.get('request')
        return request.build_absolute_uri(
            reverse(
                'api:v1:filebrowser',
                kwargs={
                    'path': self.get_path(path)
                }
            )
        )


class FileSerializer(FileBrowserBaseSerializer):

    path = serializers.SerializerMethodField()
    mime = serializers.SerializerMethodField()
    preview_url = serializers.SerializerMethodField()

    def get_path(self, path):
        root = self.get_root()
        return path.relative_to(root).as_posix()

    def get_mime(self, path):
        return guess_type(path.name)[0]

    def get_preview_url(self, path):
        mime = self.get_mime(path) or ''
        if mime.startswith('image/'):
            return thumbnail_url(self.get_path(path))


class BaseDirectorySerializer(FileBrowserBaseSerializer):

    url = serializers.SerializerMethodField()
    path = serializers.SerializerMethodField()

    def get_url(self, path):
        return self.get_url_for_path(path)


class DirectorySerializer(BaseDirectorySerializer):

    parentDirs = serializers.SerializerMethodField()

    childrenDirs = serializers.SerializerMethodField()

    files = serializers.SerializerMethodField()

    def get_parentDirs(self, path):
        path = path.resolve()
        root = self.get_root()
        parent_dirs = [p for p in path.parents if p >= root]
        parent_dirs.reverse()
        return BaseDirectorySerializer(
            parent_dirs,
            many=True,
            context=self.context
        ).data

    def get_childrenDirs(self, path):
        return BaseDirectorySerializer(
            [d.resolve() for d in path.iterdir() if d.is_dir()],
            many=True,
            context=self.context
        ).data

    def get_files(self, path):
        files = [f for f in path.iterdir() if not f.is_dir()]
        files.sort(key=lambda x: x.name)
        return FileSerializer(
            files,
            many=True,
            context=self.context
        ).data


class FileBrowserMixin(object):

    root = None

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
            assert(os.access(path, os.R_OK))
        except (FileNotFoundError, AssertionError):
            raise Http404()

        serializer = DirectorySerializer(
            instance=path,
            context={
                'root': self.root_path,
                'request': request
            })
        return Response(serializer.data)


class FileOperationException(APIException):
    default_detail = 'The file operation you have requested could not be completed.'
    default_code = 'file_handling_error'


class FileBrowserFile(IncomingBaseMixin, FileBrowserMixin, APIView):

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
            context={
                'root': self.root_path,
                'request': request
            }
        )
        return Response(data=serializer.data, status=201)
