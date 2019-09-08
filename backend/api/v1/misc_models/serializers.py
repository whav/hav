from rest_framework import serializers
from apps.media.models import MediaCreator, MediaCreatorRole, License, MediaType
from apps.tags.models import Tag, ManagedTag, CollectionTag
from apps.tags.sources import TAGGING_SOURCES


class MediaCreatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaCreator
        fields = ['id', 'name']


class MediaCreatorRoleSerializer(serializers.ModelSerializer):

    class Meta:
        model = MediaCreatorRole
        fields = ['id', 'name']


class MediaLicenseSerializer(serializers.ModelSerializer):

    class Meta:
        model = License
        fields = [
            'id',
            'name'
        ]

class MediaTypeSerializer(serializers.ModelSerializer):

    type = serializers.SerializerMethodField()

    def get_type(self, obj):
        return obj.get_type_display()

    class Meta:
        model = MediaType
        fields = [
            'id',
            'name',
            'type'
        ]


class TagSerializer(serializers.ModelSerializer):

    type = serializers.SerializerMethodField()

    def get_type(self, tag):
        if isinstance(tag, ManagedTag):
            return tag.get_source_display()
        elif isinstance(tag, CollectionTag):
            return tag.collection.short_name
        return None

    class Meta:
        model = Tag
        fields = [
            'id',
            'name',
            'type'
        ]


class CollectionTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = CollectionTag
        fields = [
            'name',
            'collection'
        ]
