import os
from mimetypes import guess_type

from django.core.urlresolvers import reverse
from rest_framework import serializers

from whav.models import ImageCollection, Media
from hav.thumbor import get_image_url


class WHAVFileSerializer(serializers.Serializer):

    path = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    mime = serializers.SerializerMethodField()
    key = serializers.SerializerMethodField()
    preview_url = serializers.SerializerMethodField()

    size = serializers.SerializerMethodField()

    def get_key(self, media):
        return self.context['keys'] + [media.id]

    def get_name(self, media):
        path = self.get_path(media)
        return os.path.split(path)[1]

    def get_size(self, media):
        return media.basefile.size

    def get_path(self, media):
        return media.localfile.path

    def get_mime(self, media):
        return media.basefile.mime_type or guess_type(self.get_name(media))[0]

    def get_preview_url(self, media):
        rel_path = media.webimage.original_image
        rel_path, ext = os.path.splitext(rel_path)
        rel_path = '%s_display_image%s' %(rel_path, ext)
        url = 'https://whav.aussereurop.univie.ac.at/display/%s' % rel_path
        return get_image_url(url)


class BaseWHAVCollectionSerializer(serializers.Serializer):

    name = serializers.SerializerMethodField()
    path = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()

    allowUpload = serializers.SerializerMethodField()

    def get_name(self, instance):
        return instance.name

    def get_path(self, instance):
        return '%d' % instance.pk

    def get_url(self, instance):
        request = self.context['request']
        match = request.resolver_match
        url_lookup = '%s:%s' % (':'.join(match.namespaces), 'whav_collection')
        url_kwargs = {'collection_id': instance.pk}
        return request.build_absolute_uri(
            reverse(
                url_lookup,
                kwargs=url_kwargs
            )
        )

    def get_allowUpload(self, instance):
        return False


class BaseRootWHAVCollectionSerializer(BaseWHAVCollectionSerializer):

    def get_name(self, _):
        return 'WHAV'

    def get_path(self, _):
        return ''

    def get_url(self, _):
        request = self.context['request']
        match = request.resolver_match
        url_lookup = '%s:%s' % (':'.join(match.namespaces), 'whav_root')
        return request.build_absolute_uri(
            reverse(url_lookup)
        )


class WHAVCollectionSerializer(BaseWHAVCollectionSerializer):

    parentDirs = serializers.SerializerMethodField()
    childrenDirs = serializers.SerializerMethodField()
    files = serializers.SerializerMethodField()

    def get_childrenDirs(self, instance):
        return BaseWHAVCollectionSerializer(
            instance.get_children(),
            many=True,
            context=self.context
        ).data

    def get_parentDirs(self, instance):
        return [BaseRootWHAVCollectionSerializer(object(), context=self.context).data] + \
            BaseWHAVCollectionSerializer(
                instance.get_ancestors(),
                many=True,
                context=self.context
            ).data

    def get_files(self, ic):
        return WHAVFileSerializer(
            Media.objects.filter(imagecollection=ic).prefetch_related('basefile_set__localfile'),
            many=True,
            context={
                'keys': self.context['keys']
            }
        ).data



class RootWHAVCollectionSerializer(BaseRootWHAVCollectionSerializer):

    parentDirs = serializers.SerializerMethodField()
    childrenDirs = serializers.SerializerMethodField()
    files = serializers.SerializerMethodField()

    def get_parentDirs(self, _):
        return []

    def get_childrenDirs(self, _):
        return BaseWHAVCollectionSerializer(
            ImageCollection.get_root_nodes(),
            many=True,
            context=self.context
        ).data

    def get_files(self, _):
        return []
