from rest_framework import serializers
from apps.media.models import MediaCreator, MediaCreatorRole, License, MediaType
from apps.tags.models import Tag, TagSource
from apps.hav_collections.models import Collection
from apps.tags.sources import TAGGING_SOURCE_CHOICES


class MediaCreatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaCreator
        fields = ["id", "first_name", "last_name", "display_name",
                  "name", "email"]


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


class TagSerializer(serializers.ModelSerializer):

    name = serializers.CharField(read_only=True)
    source = serializers.SerializerMethodField()
    source_ref = serializers.SerializerMethodField()

    class Meta:
        model = Tag
        fields = ["id", "name", "source", "source_ref"]

    def get_source(self, tag):
        if tag.source:
            return tag.source.source

    def get_source_ref(self, tag):
        if tag.source:
            return tag.source.source_ref

    def create(self, validated_data):
        raise NotImplementedError()

    def update(self, instance, validated_data):
        raise NotImplementedError()


class SimpleTagSerializer(serializers.Serializer):
    id = serializers.UUIDField(required=False)
    name = serializers.CharField(required=False)
    source = serializers.ChoiceField(choices=TAGGING_SOURCE_CHOICES, required=False)
    source_ref = serializers.CharField(required=False)

    collection = serializers.PrimaryKeyRelatedField(
        queryset=Collection.objects.all(), required=False
    )

    def validate_id(self, value):
        try:
            Tag.objects.get(pk=value)
        except Tag.DoesNotExist:
            raise serializers.ValidationError("Unknown uuid.")
        else:
            return value

    def validate_source_link(self, source, source_ref):
        return source, source_ref

    def get_collection(self):
        if self.validated_data and self.validated_data.get("collection"):
            return self.validated_data["collection"]

        collection = self.context.get("collection")
        if collection is None:
            raise serializers.ValidationError("No collection found passed.")

        return collection

    def validate(self, attrs):
        # deal with source tuple
        source_values = attrs.get("source"), attrs.get("source_ref")
        if all(source_values):
            self.validate_source_link(*source_values)
        elif any(source_values):
            raise serializers.ValidationError(
                "Source and source_ref must be given or none of both."
            )

        return attrs

    def create_source(self, source_data):
        ts, created = TagSource.objects.get_or_create(**source_data)
        return ts

    def create(self):
        data = self.validated_data
        source_data = {
            "source": data.pop("source", None),
            "source_ref": data.pop("source_ref", None),
        }
        if all(source_data.values()):
            ts = self.create_source(source_data)
        else:
            ts = None
        return Tag(**data, source=ts)

    def save(self):
        collection = self.get_collection()
        pk = self.validated_data.get("id")
        if pk:
            tag = Tag.objects.get(id=pk, collection=collection)
        else:
            tag = self.create()
            tag.collection = collection
            tag.save()

        return tag
