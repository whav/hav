import os
import stat
from pathlib import Path
from urllib.request import pathname2url, url2pathname

from django.conf import settings
from django.http import Http404
from django.utils.http import quote
from django.core.urlresolvers import reverse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import serializers

from .permissions import IncomingBaseMixin


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

    size = serializers.SerializerMethodField()
    path = serializers.SerializerMethodField()

    def get_size(self, path):
        return path.stat().st_size

    def get_path(self, path):
        root = self.get_root()
        return path.relative_to(root).as_posix()


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


class FileBrowser(IncomingBaseMixin, APIView):

    root = None

    def build_absolute_path(self, path):
        absolute = os.path.join(self.root, path)
        return os.path.normpath(absolute)

    def get(self, request, path=None, **kwargs):

        print('GET hit ...')
        path = path or '/'
        root_path = Path(self.root).resolve()
        parts = path.split('/')
        parts = [url2pathname(p) for p in parts]
        path = os.path.join(self.root, *parts)

        try:
            path = Path(path).resolve()
            assert(path.is_dir())
            assert(os.access(path, os.R_OK))
            assert(path >= root_path)
        except (FileNotFoundError, AssertionError):
            raise Http404()
        print('File path resolved..')
        serializer = DirectorySerializer(
            instance=path,
            context={
                'root': root_path,
                'request': request
            })
        print('Serializer initialized')
        return Response(serializer.data)


