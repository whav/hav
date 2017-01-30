import os
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


class FileBrowserBaseSerializer(serializers.Serializer):

    name = serializers.ReadOnlyField()

    r_ok = serializers.SerializerMethodField()
    w_ok = serializers.SerializerMethodField()

    def get_r_ok(self, path):
        return os.access(path, os.R_OK)

    def get_w_ok(self, path):
        return os.access(path, os.W_OK)

    def get_root(self):
        return self.context['root']

    def get_url_for_path(self, path):
        request = self.context.get('request')
        root = self.context.get('root')
        location = ''
        relative_path = path.relative_to(root)
        parts = relative_path.parts

        if len(parts) > 0:
            suffix = '/' if relative_path.is_dir() else ''
            location = os.path.join(*parts, suffix)
            location = quote(location)

        return request.build_absolute_uri(
            reverse(
                'api:v1:filebrowser',
                kwargs={
                    'filepath': location
                }
            )
        )


class FileSerializer(FileBrowserBaseSerializer):

    size = serializers.SerializerMethodField()

    def get_size(self, path):
        return path.stat().st_size

class DirectorySerializer(FileBrowserBaseSerializer):

    url = serializers.SerializerMethodField()

    def get_url(self, path):
        return self.get_url_for_path(path)


class FilePathSerializer(FileBrowserBaseSerializer):

    parent_url = serializers.SerializerMethodField()

    path = serializers.SerializerMethodField()

    children = serializers.SerializerMethodField(method_name='get_children_directories')

    def get_children_directories(self, path):
        return DirectorySerializer(
            [d for d in path.iterdir() if d.is_dir()],
            many=True,
            context=self.context
        ).data

    files = serializers.SerializerMethodField()

    def get_files(self, path):
        return FileSerializer(
            [f for f in path.iterdir() if not f.is_dir()],
            many=True,
            context=self.context
        ).data

    def get_path(self, path):
        root = self.get_root()
        return path.relative_to(root).as_posix()

    def get_parent_url(self, path):
        root = self.get_root()
        if root >= path:
            return None
        return self.get_url_for_path(path.parent)

    def get_children(self, path):
        root = self.get_root()
        contents = []
        for child in path.iterdir():
            location = child.relative_to(root).as_posix()
            contents.append({
                'path': location,
                'is_dir': child.is_dir(),
                'r_ok': os.access(child, os.R_OK),
                'w_ok': os.access(child, os.W_OK),
                'stat': child.stat(),
                'url': self.get_url_for_path(child)
            })
        return contents


class FileBrowser(IncomingBaseMixin, APIView):

    root = settings.MEDIA_ROOT

    def build_absolute_path(self, path):
        absolute = os.path.join(self.root, path)
        return os.path.normpath(absolute)

    def get(self, request, filepath=None, **kwargs):
        root_path = Path(self.root).resolve()

        parts = filepath.split('/')
        parts = [url2pathname(p) for p in parts]
        filepath = os.path.join(self.root, *parts)

        try:
            path = Path(filepath).resolve()
        except FileNotFoundError:
            raise Http404()

        # basic security check for the requested path
        if path < root_path:
            print('Illegal path requested')
            raise Http404()

        serializer = FilePathSerializer(
            instance=path,
            context={
                'root': root_path,
                'request': request
            })

        return Response(serializer.data)


