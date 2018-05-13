import os
from mimetypes import guess_type
from rest_framework import serializers
from rest_framework.reverse import reverse

from apps.whav.models import ImageCollection, MediaOrdering
from hav.utils.imaginary import generate_imaginary_url

class WHAVSerializerMixin(object):


    @property
    def _config(self):
        return self.context['source_config']

    @property
    def request(self):
        return self.context['request']

    def get_isFile(self, obj):
        return isinstance(obj, MediaOrdering)


class WHAVFileSerializer(WHAVSerializerMixin, serializers.Serializer):

    path = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    mime = serializers.SerializerMethodField()
    preview_url = serializers.SerializerMethodField()

    size = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()

    ingestable = serializers.SerializerMethodField()

    isFile = serializers.SerializerMethodField()


    def get_name(self, mo):
        media = mo.media
        path = self.get_path_for_media(media)
        return os.path.split(path)[1]

    def get_size(self, mo):
        media = mo.media
        return media.basefile.size

    def get_path_for_media(self, media):
        return media.localfile.path

    def get_path(self, mo):
        media = mo.media
        return self.get_path_for_media(media)

    def get_mime(self, mo):
        media = mo.media
        return media.basefile.mime_type or guess_type(self.get_name(mo))[0]

    def get_preview_url(self, mo):
        media = mo.media
        rel_path = media.webimage.original_image
        rel_path, ext = os.path.splitext(rel_path)
        rel_path = '%s_display_image%s' %(rel_path, ext)
        url = 'https://whav.aussereurop.univie.ac.at/display/%s' % rel_path
        return generate_imaginary_url(url)

    def get_url(self, mo):
        return self._config.to_url(mo, self.request)

    def get_ingestable(self, _):
        return True

class BaseWHAVCollectionSerializer(WHAVSerializerMixin, serializers.Serializer):

    name = serializers.SerializerMethodField()
    path = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()

    allowUpload = serializers.SerializerMethodField()
    isFile = serializers.SerializerMethodField()

    def get_name(self, instance):
        return instance.name

    def get_path(self, instance):
        return '%d' % instance.pk

    def get_url(self, instance):
        return self._config.to_url(instance, self.request)

    def get_allowUpload(self, instance):
        return False


class BaseRootWHAVCollectionSerializer(BaseWHAVCollectionSerializer):

    def get_name(self, _):
        return 'WHAV'

    def get_path(self, _):
        return ''

    def get_url(self, _):
        return super().get_url(None)




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
            MediaOrdering.objects.filter(collection=ic),
            many=True,
            context=self.context
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


