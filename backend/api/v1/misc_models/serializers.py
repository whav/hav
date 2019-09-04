from rest_framework import serializers
from apps.media.models import MediaCreator, MediaCreatorRole, License, MediaType
from apps.tags.models import Tag

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
    class Meta:
        model = Tag
        fields = [
            'id',
            'name',
        ]
