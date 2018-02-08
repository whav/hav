import os
import stat
import base64
from mimetypes import guess_type
from django.urls import reverse
from rest_framework import serializers
import binascii
from hav.thumbor import get_image_url

import logging

logger = logging.getLogger(__name__)

def encodePath(path):
    return base64.urlsafe_b64encode(path.encode('utf-8')).decode('utf-8')

def decodePath(encodedPath):
    try:
        return base64.urlsafe_b64decode(encodedPath).decode('utf-8')
    except binascii.Error as e:
        logger.warning(e)
        raise ValueError('%s can not be decoded.' % encodedPath)


def is_hidden(fn):
    return fn.startswith('.')

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

    @property
    def _config(self):
        return self.context['source_config']

    @property
    def request(self):
        return self.context['request']

    def get_name(self, path):
        if path == self.get_root():
            return 'Root'
        return path.name

    # some methods that are used in subclasses
    def get_root(self):
        return self._config.root

    def get_size(self, path):
        return path.stat().st_size

    def get_path(self, path):
        return self._config.to_url_path(path)

    def get_url_for_path(self, path):
        rel_url = self._config.to_url(path, self.request)
        return self.request.build_absolute_uri(rel_url)


class FileSerializer(FileBrowserBaseSerializer):

    path = serializers.SerializerMethodField()
    mime = serializers.SerializerMethodField()
    preview_url = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()

    def get_path(self, path):
        return self._config.to_url_path(path)

    def get_url(self, path):
        return self.request.build_absolute_uri(self._config.to_url(path, self.request))

    def get_mime(self, path):
        return guess_type(path.name)[0]

    def get_preview_url(self, path):
        # TODO: fix me!
        mime = self.get_mime(path) or ''
        if mime.startswith('image/'):
            rel_path = path.relative_to(self.get_root()).as_posix()
            return get_image_url(rel_path)


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
        parent_dirs = [p for p in path.parents if p >= self._config.root_path]
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
        files = [f for f in path.iterdir() if not f.is_dir() and not is_hidden(f.name)]
        files.sort(key=lambda f: f.name)
        return FileSerializer(
            files,
            many=True,
            context=self.context
        ).data

    def get_allowUpload(self, path):
        return True