import math

from django.urls import reverse
from django.utils.functional import cached_property
from rest_framework import serializers

from hav.apps.hav_collections.models import Collection
from hav.apps.media.models import Media
from hav.apps.sets.models import Node
from hav.utils.imaginary import generate_srcset_urls, generate_thumbnail_url


class CollectionSerializer(serializers.ModelSerializer):

    root_node = serializers.HyperlinkedRelatedField(
        view_name="api:public:node_detail",
        lookup_url_kwarg="node_id",
        read_only=True,
    )

    class Meta:
        model = Collection
        fields = ["name", "short_name", "slug", "root_node"]


class SimpleNodeSerializer(serializers.ModelSerializer):
    url = serializers.HyperlinkedIdentityField(
        view_name="api:public:node_detail",
        lookup_url_kwarg="node_id",
        source="id",
        read_only=True,
    )

    class Meta:
        model = Node
        fields = ["id", "name", "url"]


class NodeSerializer(SimpleNodeSerializer):

    url = serializers.SerializerMethodField()

    children = SimpleNodeSerializer(many=True, read_only=True)
    ancestors = SimpleNodeSerializer(
        many=True, source="collection_ancestors", read_only=True
    )
    collection = CollectionSerializer(source="get_collection")

    representative_media_id = serializers.SerializerMethodField()

    def get_representative_media_id(self, node: Node):
        return node.get_representative_media().pk

    def get_url(self, node: Node):
        collection = node.get_collection()
        return reverse(
            "hav:folder_view",
            kwargs={"collection_slug": collection.slug, "node_pk": node.pk},
        )

    class Meta(SimpleNodeSerializer.Meta):
        model = Node
        fields = SimpleNodeSerializer.Meta.fields + [
            "description",
            "display_type",
            "children",
            "ancestors",
            "collection",
            "representative_media_id",
        ]


class MediaSerializer(serializers.ModelSerializer):

    url = serializers.SerializerMethodField()
    set_url = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()
    srcset = serializers.SerializerMethodField()
    media_type = serializers.SerializerMethodField()
    aspect_ratio = serializers.SerializerMethodField()

    @cached_property
    def webasset(self):
        return self.instance.primary_image_webasset

    def get_url(self, media):
        return reverse(
            "hav:media_view",
            kwargs={"collection_slug": media.collection.slug, "media_pk": media.pk},
        )

    def get_set_url(self, media):
        return reverse(
            "hav:folder_view",
            kwargs={"collection_slug": media.collection.slug, "node_pk": media.set.pk},
        )

    def get_thumbnail(self, media):
        return generate_thumbnail_url(
            self.webasset,
            width=300,
            height=None,
            operation="thumbnail",
        )

    def get_srcset(self, media):
        return generate_srcset_urls(self.webasset)

    def get_display_width(self, media):
        webasset = self.webasset
        if webasset.aspect_ratio:
            width = math.floor(math.sqrt(48000 * webasset.aspect_ratio))
            return f"{width}px"
        return ""

    def get_media_type(self, media):
        mime = media.primary_file.mime_type
        if mime:
            return mime.split("/")[0]

    def get_aspect_ratio(self, media):
        return self.webasset.aspect_ratio

    class Meta:
        model = Media
        fields = [
            "title",
            "url",
            "set_url",
            "aspect_ratio",
            "thumbnail",
            "srcset",
            "media_type",
        ]
