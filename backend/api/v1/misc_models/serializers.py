from rest_framework import serializers
from apps.media.models import MediaCreator


class MediaCreatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaCreator
        fields = ['id', 'name']


