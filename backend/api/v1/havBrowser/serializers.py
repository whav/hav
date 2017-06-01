from django.core.urlresolvers import reverse
from rest_framework import serializers

from hav.sets.models import Node


class BaseHAVNodeSerializer(serializers.Serializer):

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
        url_lookup = '%s:%s' % (':'.join(match.namespaces), 'hav_set')
        url_kwargs = {'node_id': instance.pk}
        return request.build_absolute_uri(
            reverse(
                url_lookup,
                kwargs=url_kwargs
            )
        )

    def get_allowUpload(self, instance):
        return False

    def get_files(self, instance):
        return []


class HAVNodeSerializer(BaseHAVNodeSerializer):

    parentDirs = serializers.SerializerMethodField()
    childrenDirs = serializers.SerializerMethodField()

    files = serializers.SerializerMethodField()

    def get_childrenDirs(self, instance):
        return BaseHAVNodeSerializer(
            instance.get_children(),
            many=True,
            context=self.context
        ).data

    def get_parentDirs(self, instance):
        return [BaseRootHAVNodeSerializer(object(), context=self.context).data] + \
            BaseHAVNodeSerializer(
                instance.get_ancestors(),
                many=True,
                context=self.context
            ).data


class BaseRootHAVNodeSerializer(BaseHAVNodeSerializer):

    def get_name(self, _):
        return 'HAV'

    def get_path(self, _):
        return ''

    def get_url(self, _):
        request = self.context['request']
        match = request.resolver_match
        url_lookup = '%s:%s' % (':'.join(match.namespaces), 'hav_root')
        return request.build_absolute_uri(
            reverse(url_lookup)
        )

class RootHAVCollectionSerializer(BaseRootHAVNodeSerializer):

    parentDirs = serializers.SerializerMethodField()
    childrenDirs = serializers.SerializerMethodField()
    files = serializers.SerializerMethodField()

    def get_parentDirs(self, _):
        return []

    def get_childrenDirs(self, _):
        return BaseHAVNodeSerializer(
            Node.get_root_nodes(),
            many=True,
            context=self.context
        ).data

    def get_files(self, _):
        return []
