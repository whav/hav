from django.urls import reverse
from django.utils.functional import cached_property
from rest_framework import serializers
from apps.hav_collections.models import Collection
from apps.sets.models import Node
from apps.media.models import Media
from hav_utils.imaginary import generate_thumbnail_url


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

    children = SimpleNodeSerializer(many=True, read_only=True)
    ancestors = SimpleNodeSerializer(
        many=True, source="collection_ancestors", read_only=True
    )
    collection = CollectionSerializer(source="get_collection")

    class Meta(SimpleNodeSerializer.Meta):
        model = Node
        fields = SimpleNodeSerializer.Meta.fields + [
            "description",
            "display_type",
            "children",
            "ancestors",
            "collection",
        ]


class MediaSerializer(serializers.ModelSerializer):

    url = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()
    srcset = serializers.SerializerMethodField()

    @property
    def webasset(self):
        return self.instance.primary_image_webasset

    def get_url(self, media):
        return reverse(
            "hav:media_view",
            kwargs={"collection_slug": media.collection.slug, "media_pk": media.pk},
        )

    def get_thumbnail(self, media):
        return generate_thumbnail_url(self.webasset, user=self.context["request"].user)

    def get_srcset(self, media):
        return []

    class Meta:
        model = Media
        fields = ["title", "url", "thumbnail", "srcset"]
