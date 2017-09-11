import os
from mimetypes import guess_type
from urllib.parse import urlunparse
from rest_framework import serializers
from rest_framework.reverse import reverse

from apps.whav.models import ImageCollection, MediaOrdering
from hav.thumbor import get_image_url


class IngestionSerializer(serializers.Serializer):
    fs_location = serializers.SerializerMethodField()


class WHAVFileSerializer(serializers.Serializer):

    path = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    mime = serializers.SerializerMethodField()
    preview_url = serializers.SerializerMethodField()

    size = serializers.SerializerMethodField()
    detail_url = serializers.SerializerMethodField()

    guid = serializers.SerializerMethodField()


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
        return get_image_url(url)

    def get_detail_url(self, mo):
        request = self.context['request']
        name = ':'.join(request.resolver_match.namespaces + ['whav_media'])
        return request.build_absolute_uri(reverse(
            name,
            kwargs={
                'collection_id': mo.collection_id,
                'media_id': mo.media_id
            }
        ))

    def get_guid(self, mo):
        args = (
            self.context['scheme'],
            self.context['identifier'],
            str(mo.media.pk),
            None,
            None,
            None
        )
        return urlunparse(args)



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
            MediaOrdering.objects.filter(collection=ic), #.select_related('media', 'media__basefile_set__localfile'),
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

