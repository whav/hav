import os
from mimetypes import guess_type
from rest_framework import serializers
from rest_framework.reverse import reverse

from ..utils.ingest import buildIngestId
from apps.whav.models import ImageCollection, MediaOrdering
from hav.thumbor import get_image_url



class WHAVFileSerializer(serializers.Serializer):

    path = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    mime = serializers.SerializerMethodField()
    preview_url = serializers.SerializerMethodField()

    size = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()

    ingest_id = serializers.SerializerMethodField()

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

    def get_url(self, mo):
        request = self.context['request']
        name = ':'.join(request.resolver_match.namespaces + ['whav_media'])
        return request.build_absolute_uri(reverse(
            name,
            kwargs={
                'mediaordering_id': mo.pk
            }
        ))

    def get_ingest_id(self, mo):
        print(self.context)
        return buildIngestId(
            self.context['identifier'],
            '%d/%d' % (mo.collection_id, mo.media_id)
        )


class BaseWHAVCollectionSerializer(serializers.Serializer):

    name = serializers.SerializerMethodField()
    path = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()

    allowUpload = serializers.SerializerMethodField()

    ingest_id = serializers.SerializerMethodField()

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

    def get_ingest_id(self, instance):
        return buildIngestId(
            self.context['identifier'],
            '%d' % instance.pk
        )


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

    def get_ingest_id(self, _):
        return None



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


