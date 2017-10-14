from rest_framework import serializers

from apps.media.models import MediaToCreator, MediaCreatorRole, Media, MediaCreator, License
from apps.sets.models import Node

class MediaLicenseSerializer(serializers.ModelSerializer):

    class Meta:
        model = License
        fields = [
            'id',
            'name'
        ]


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

    creators = serializers.PrimaryKeyRelatedField(queryset=MediaCreator.objects.all(), many=True)
    license = serializers.PrimaryKeyRelatedField(queryset=License.objects.all())

    def create(self, validated_data):
        print(validated_data)


class BatchMediaSerializer(serializers.Serializer):

    target = serializers.PrimaryKeyRelatedField(
        queryset=Node.objects.all()
    )

    entries = CreateMediaSerializer(many=True)

    def create(self, validated_data):
        return validated_data
        # return {'success': True}