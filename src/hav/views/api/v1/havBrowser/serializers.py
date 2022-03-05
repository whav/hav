import os
from django.urls import reverse
from rest_framework import serializers

from hav.apps.sets.models import Node
from hav.apps.media.models import Media
from hav.apps.archive.models import ArchiveFile
from hav.apps.webassets.models import WebAsset
from hav.apps.hav_collections.models import Collection
from hav.apps.tags.models import Tag
from ..misc_models.serializers import TagSerializer
from hav.utils.imaginary import generate_thumbnail_url


class HAVCollectionSerializer(serializers.ModelSerializer):

    # url = serializers.SerializerMethodField()
    #
    # def get_url(self, collection):
    #     request = self.context.get('request')
    #     match = request.resolver_match
    #     url_lookup = '%s:%s' % (':'.join(match.namespaces), 'hav_set')
    #     url_kwargs = {'pk': collection.root_node_id}
    #     return request.build_absolute_uri(
    #         reverse(
    #             url_lookup,
    #             kwargs=url_kwargs
    #         )
    #     )

    class Meta:
        model = Collection
        fields = [
            "name",
            "short_name",
            "id",
            # 'url',
        ]


class HAVArchiveFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArchiveFile
        fields = "__all__"


class HAVWebAssetSerializer(serializers.ModelSerializer):

    url = serializers.SerializerMethodField()

    def get_url(self, webasset):
        return webasset.file.url

    class Meta:
        model = WebAsset
        fields = ["url", "mime_type", "id"]


class SimpleHAVMediaSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="title")
    url = serializers.SerializerMethodField()
    preview_url = serializers.SerializerMethodField()

    ingestable = serializers.SerializerMethodField()

    mime_type = serializers.SerializerMethodField()

    def get_mime_type(self, media):
        return media.primary_file.mime_type if media.primary_file else ""

    def get_url(self, instance):
        url_lookup = "api:v1:hav_browser:hav_media"

        try:
            request = self.context["request"]
            absolute_uri_builder = request.build_absolute_uri
            match = request.resolver_match
            url_lookup = "%s:%s" % (":".join(match.namespaces), "hav_media")
        except KeyError as original_error:
            try:
                hostname = self.context["hostname"]

                def absolute_uri_builder(url_path):
                    # TODO: use hostname to build an absolute url
                    return hostname + url_path

            except KeyError:
                raise original_error

        url_kwargs = {"pk": instance.pk}
        relative_url = reverse(url_lookup, kwargs=url_kwargs)
        return absolute_uri_builder(relative_url)

    def get_preview_url(self, media):
        if media.primary_file:
            webasset_images = filter(
                lambda x: x.mime_type.startswith("image"),
                media.primary_file.webasset_set.all(),
            )
            webasset_images = list(webasset_images)
            try:
                webasset = webasset_images[0]
            except IndexError:
                return None
            else:
                return generate_thumbnail_url(webasset)

    def get_ingestable(self, _):
        return False

    class Meta:
        model = Media
        fields = [
            "pk",
            "name",
            "title",
            "url",
            "ingestable",
            "preview_url",
            "mime_type",
        ]


class HAVMediaSerializer(SimpleHAVMediaSerializer):

    archive_files = HAVArchiveFileSerializer(source="files", many=True)
    webassets = serializers.SerializerMethodField()

    def get_webassets(self, media):
        assets = WebAsset.objects.filter(archivefile__media__id=media.pk)
        return HAVWebAssetSerializer(assets, many=True, context=self.context).data

    class Meta(SimpleHAVMediaSerializer.Meta):
        fields = SimpleHAVMediaSerializer.Meta.fields + [
            "archive_files",
            "webassets",
            "description",
            "tags",
        ]


class BaseHAVNodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Node
        fields = ["name", "path", "url", "allowUpload", "allowCreate"]

    path = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()

    allowUpload = serializers.SerializerMethodField()
    allowCreate = serializers.SerializerMethodField()

    def get_path(self, instance):
        return "%d" % instance.pk

    def get_url(self, instance):
        request = self.context["request"]
        match = request.resolver_match
        url_lookup = "%s:%s" % (":".join(match.namespaces), "hav_set")
        url_kwargs = {"pk": instance.pk}
        return request.build_absolute_uri(reverse(url_lookup, kwargs=url_kwargs))

    def get_allowUpload(self, instance):
        return False

    def get_allowCreate(self, instance):
        return True

    def get_files(self, instance):
        return []


class HAVNodeSerializer(BaseHAVNodeSerializer):
    class Meta(BaseHAVNodeSerializer.Meta):
        fields = BaseHAVNodeSerializer.Meta.fields + [
            "description",
            "tags",
            "tags_full",
            "inherited_tags",
            "collection",
            "parentDirs",
            "childrenDirs",
            "files",
        ]

    collection = HAVCollectionSerializer(read_only=True, source="get_collection")

    tags_full = serializers.SerializerMethodField()
    inherited_tags = serializers.SerializerMethodField()

    parentDirs = serializers.SerializerMethodField()
    childrenDirs = serializers.SerializerMethodField()
    files = serializers.SerializerMethodField()

    def get_tags_full(self, instance):
        return TagSerializer(
            instance.tags.all().select_related("source"),
            many=True,
            context={"node_id": instance.pk},
        ).data

    def get_inherited_tags(self, instance):
        data = []
        for ancestor in instance.get_ancestors():
            data.extend(
                TagSerializer(
                    Tag.objects.filter(node=ancestor.pk).select_related("source"),
                    many=True,
                    context={"node_id": ancestor.pk},
                ).data
            )
        return data

    def get_childrenDirs(self, instance):
        return BaseHAVNodeSerializer(
            instance.get_children(), many=True, context=self.context
        ).data

    def get_parentDirs(self, instance):
        return [
            BaseRootHAVNodeSerializer(object(), context=self.context).data
        ] + BaseHAVNodeSerializer(
            instance.get_ancestors(), many=True, context=self.context
        ).data

    def create(self, validated_data):
        parent = self.context.get("parent_node")
        tags = validated_data.pop("tags", [])
        if not parent:
            raise serializers.ValidationError("Cannot create root nodes.")
        node = parent.add_child(**validated_data)
        node.tags.set(tags)
        return node

    def get_files(self, instance):
        return SimpleHAVMediaSerializer(
            instance.media_set.all().prefetch_related("files__webasset_set"),
            many=True,
            context=self.context,
        ).data


class BaseRootHAVNodeSerializer(BaseHAVNodeSerializer):

    # these fields need to be kept in sync with the base serializer above
    name = serializers.SerializerMethodField()

    def get_name(self, _):
        return "HAV"

    def get_path(self, _):
        return ""

    def get_url(self, _):
        request = self.context["request"]
        match = request.resolver_match
        url_lookup = "%s:%s" % (":".join(match.namespaces), "hav_root")
        return request.build_absolute_uri(reverse(url_lookup))

    def get_allowCreate(self, instance):
        return False


class RootHAVCollectionSerializer(BaseRootHAVNodeSerializer):
    class Meta(BaseRootHAVNodeSerializer.Meta):
        fields = BaseRootHAVNodeSerializer.Meta.fields + [
            "description",
            "tags",
            "parentDirs",
            "childrenDirs",
            "files",
        ]

    description = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()

    parentDirs = serializers.SerializerMethodField()
    childrenDirs = serializers.SerializerMethodField()
    files = serializers.SerializerMethodField()

    def get_description(self, _):
        return ""

    def get_tags(self, _):
        return []

    def get_parentDirs(self, _):
        return []

    def get_childrenDirs(self, _):
        return BaseHAVNodeSerializer(
            Node.get_collection_roots(), many=True, context=self.context
        ).data

    def get_files(self, _):
        return []
