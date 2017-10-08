from rest_framework import serializers

from apps.media.models import MediaToCreator, MediaCreatorRole, Media


class MediaCreatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaToCreator
        fields = ['role', 'creator']

class CreateMediaSerializer(serializers.Serializer):

    year = serializers.IntegerField(min_value=1950, max_value=2050)
    month = serializers.IntegerField(min_value=1, max_value=12)
    day = serializers.IntegerField(min_value=1, max_value=31)

    creators = MediaCreatorSerializer(many=True)
