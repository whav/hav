import os
from rest_framework import serializers

from apps.media.models import MediaToCreator, MediaCreatorRole, Media, MediaCreator, License
from apps.media.utils.dtrange import range_from_partial_date
from apps.sets.models import Node
from apps.archive.tasks import archive

from psycopg2.extras import DateTimeTZRange

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

    ingestion_id = serializers.CharField(max_length=500)

    year = serializers.IntegerField(min_value=1950, max_value=2050)
    month = serializers.IntegerField(min_value=1, max_value=12, required=False)
    day = serializers.IntegerField(min_value=1, max_value=31, required=False)
    timestamp = serializers.DateTimeField(required=False)

    creators = serializers.PrimaryKeyRelatedField(queryset=MediaCreator.objects.all(), many=True)
    license = serializers.PrimaryKeyRelatedField(queryset=License.objects.all())

    def validate_ingestion_id(self, value):
        if not os.path.exists(value):
            raise serializers.ValidationError('The file {} does not seem to exist.'.format(value))

        if not os.path.isfile(value):
            raise serializers.ValidationError('The path {} does not point to a file.'.format(value))

        if not os.access(value, os.R_OK):
            raise serializers.ValidationError('The file at {} is not readable.'.format(value))

        return value


    def validate(self, data):
        year = data.get('year')
        month = data.get('month')
        day = data.get('day')
        timestamp = data.get('timestamp')

        if any([year, month, day]) and timestamp:
            raise serializers.ValidationError('Can not use timestamp and any of year, month, day together.')

        if any([year, month, day]):
            start, end = range_from_partial_date(year, month, day)

            if start > end:
                raise serializers.ValidationError('Start can not be before end of timerange.')

        return data


class SimpleMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = ['pk', 'creators', 'license', 'creation_date']



class BatchMediaSerializer(serializers.Serializer):

    target = serializers.PrimaryKeyRelatedField(
        queryset=Node.objects.all()
    )

    entries = CreateMediaSerializer(many=True)

    def create(self, validated_data):
        media_entries = []
        target = validated_data.get('target')
        user = self.context['user']

        for entry_data in validated_data.get('entries', []):
            dt_range = range_from_partial_date(entry_data.get('year'), entry_data.get('month'), entry_data.get('day'))
            mo = Media.objects.create(
                    creation_date=DateTimeTZRange(lower=dt_range[0], upper=dt_range[1]),
                    license=entry_data.get('license'),
                    set=target,
                    created_by=user
                )
            # save m2m relations
            for creator in entry_data['creators']:
                MediaToCreator.objects.create(
                    creator=creator,
                    media=mo
                )
            media_entries.append(mo)

        filenames = [e['ingestion_id'] for e in validated_data.get('entries', [])]

        for filename, media in zip(filenames, media_entries):
            archive.delay(filename, media.pk, user.pk)

        return SimpleMediaSerializer(media_entries, many=True).data

