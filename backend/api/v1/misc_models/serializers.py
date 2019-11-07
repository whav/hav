from rest_framework import serializers
from apps.media.models import MediaCreator, MediaCreatorRole, License, MediaType
from apps.tags.models import Tag
from apps.hav_collections.models import Collection
from ..permissions import has_collection_permission
from apps.tags.sources import TAGGING_SOURCE_CHOICES


class MediaCreatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaCreator
        fields = ["id", "name"]


class MediaCreatorRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaCreatorRole
        fields = ["id", "name"]


class MediaLicenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = License
        fields = ["id", "name"]


class MediaTypeSerializer(serializers.ModelSerializer):

    type = serializers.SerializerMethodField()

    def get_type(self, obj):
        return obj.get_type_display()

    class Meta:
        model = MediaType
        fields = ["id", "name", "type"]


class TagSearchSerializer(serializers.Serializer):
    collection = serializers.PrimaryKeyRelatedField(
        queryset=Collection.objects.all(), required=False, default=None
    )
    search = serializers.CharField(required=False, default=None)


class TagSerializer(serializers.ModelSerializer):

    type = serializers.SerializerMethodField()
    node = serializers.SerializerMethodField()

    def get_node(self, tag):
        return self.context.get("node_id")

    def get_type(self, tag):
        # FIXME
        return None

    class Meta:
        model = Tag
        fields = ["id", "name", "type", "node"]


class CollectionTagSerializer(serializers.ModelSerializer):
    def validate(self, data):
        user = self.context["request"].user
        if not has_collection_permission(user, data["collection"]):
            raise serializers.ValidationError("No permission to add tag to collection.")
        return data

    class Meta:
        model = Tag
        fields = ["name", "collection"]
