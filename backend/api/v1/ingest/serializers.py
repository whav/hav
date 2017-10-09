from rest_framework import serializers

from apps.media.models import MediaToCreator, MediaCreatorRole, Media


class MediaCreatorRoleSerializer(serializers.ModelSerializer):

    name = serializers.SerializerMethodField()

    def get_name(self, mcr):
        return str(mcr)

    class Meta:
        model = MediaCreatorRole
        fields = ['id', 'name']

class MediaCreatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaToCreator
        fields = ['role', 'creator']

class CreateMediaSerializer(serializers.Serializer):

    year = serializers.IntegerField(min_value=1950, max_value=2050)
    month = serializers.IntegerField(min_value=1, max_value=12)
    day = serializers.IntegerField(min_value=1, max_value=31)

    creators = MediaCreatorSerializer(many=True)
