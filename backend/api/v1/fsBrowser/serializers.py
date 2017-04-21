import os
import stat
from mimetypes import guess_type

from django.core.urlresolvers import reverse
from django.utils.http import quote
from rest_framework import serializers

from hav.thumbor import get_image_url

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
    # stat = FileStatsSerializer(source='*')
    size = serializers.SerializerMethodField()

    def get_name(self, path):
        if path == self.get_root():
            return 'Root'
        return path.name

    # some methods that are used in subclasses
    def get_root(self):
        return self.context['root']

    def get_size(self, path):
        return path.stat().st_size

    def get_path(self, path):
        root = self.context.get('root')
        location = ''
        relative_path = path.relative_to(root)
        parts = relative_path.parts

        if len(parts) > 0:
            suffix = '/' if relative_path.is_dir() else ''
            location = os.path.join(*(list(parts) + [suffix]))
            location = quote(location)

        return location

    def get_url_for_path(self, path):
        request = self.context.get('request')
        match = request.resolver_match
        url_lookup = '%s:%s' % (':'.join(match.namespaces), match.url_name)
        return request.build_absolute_uri(
            reverse(
                url_lookup,
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
            return get_image_url(self.get_path(path))


class BaseDirectorySerializer(FileBrowserBaseSerializer):

    url = serializers.SerializerMethodField()
    path = serializers.SerializerMethodField()

    def get_url(self, path):
        return self.get_url_for_path(path)


class DirectorySerializer(BaseDirectorySerializer):

    parentDirs = serializers.SerializerMethodField()

    childrenDirs = serializers.SerializerMethodField()

    files = serializers.SerializerMethodField()

    allowUpload = serializers.SerializerMethodField()

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

    def get_allowUpload(self, path):
        return True
