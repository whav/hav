import os

from django.contrib.auth.models import User
from pathlib import Path
from rest_framework import serializers

from apps.media.models import MediaToCreator, MediaCreatorRole, Media, MediaCreator, License
from apps.media.utils.dtrange import range_from_partial_date
from apps.sets.models import Node
from apps.archive.tasks import archive
from apps.archive.operations.hash import generate_hash
from apps.archive.models import ArchiveFile
from apps.ingest.models import IngestQueue

from apps.whav.models import Media
from psycopg2.extras import DateTimeTZRange

from .fields import HAVTargetField, IngestHyperlinkField, FinalIngestHyperlinkField, resolveUrlToObject

import logging

logger = logging.getLogger(__name__)


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

    def validate_ingestion_identifier(self, value):
        if not os.path.exists(value):
            raise serializers.ValidationError('The file {} does not seem to exist.'.format(value))

        if not os.path.isfile(value):
            raise serializers.ValidationError('The path {} does not point to a file.'.format(value))

        if not os.access(value, os.R_OK):
            raise serializers.ValidationError('The file at {} is not readable.'.format(value))

        hash = generate_hash(value)
        try:
            af = ArchiveFile.objects.get(hash=hash)
        except ArchiveFile.DoesNotExist:
            return value
        else:
            raise serializers.ValidationError('''
                The same file already exists in the archive. 
                The associated media id is {}'''.format(af.media_set.get().pk))

    def validate_dates(self, data):
        year = data.get('year')
        month = data.get('month')
        day = data.get('day')

        timestamp = data.get('timestamp')

        if day and not month:
            raise serializers.ValidationError('Cannot have a day without a month')

        if any([year, month, day]) and timestamp:
            raise serializers.ValidationError('Can not use timestamp and any of year, month, day together.')

        if any([year, month, day]):
            start, end = range_from_partial_date(year, month, day)

            if start > end:
                raise serializers.ValidationError('Start can not be before end of timerange.')

    def validate(self, data):
        # print(data)
        # self.validate_ingestion_identifier(data.get('ingestion_id'))
        self.validate_dates(data)
        return data




class SimpleMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = ['pk', 'creators', 'license', 'creation_date']



class BatchMediaSerializer(serializers.Serializer):

    target = HAVTargetField()

    entries = CreateMediaSerializer(many=True)

    def create(self, validated_data):
        target = validated_data['target']
        user = self.context['user']

        raw_entry_data = self.data
        raw_entries = raw_entry_data.pop('entries', [])

        tasks = []

        for media_data in raw_entries:
            media_data.update(raw_entry_data)
            media_data.update({
                'user': user.pk,
                'target': target.pk
            })

            # queue the task
            task = archive.delay(media_data)
            # collect task ids
            tasks.append(task.id)

        return tasks



class IngestSerializer(CreateMediaSerializer):

    target = serializers.PrimaryKeyRelatedField(queryset=Node.objects.all())
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    def create(self, vd):
        # construct date time range
        dt_range = range_from_partial_date(vd.get('year'), vd.get('month'), vd.get('day'))

        # actually create the media object
        media = Media.objects.create(
                    creation_date=DateTimeTZRange(lower=dt_range[0], upper=dt_range[1]),
                    license=vd.get('license'),
                    set=vd.target,
                    created_by=vd.user
                )

        # save m2m
        for creator in vd['creators']:
            MediaToCreator.objects.create(
                creator=creator,
                media=media
            )

        return SimpleMediaSerializer(media)


class IngestionItemSerializer(serializers.Serializer):

    path = serializers.ListField(serializers.CharField(max_length=200))

    item = FinalIngestHyperlinkField()


class PrepareIngestSerializer(serializers.Serializer):

    target = HAVTargetField()

    items = serializers.ListField(
        child=IngestHyperlinkField()
    )


class IngestSerializer(serializers.Serializer):

    source = IngestHyperlinkField()
    date = serializers.CharField()
    creators = serializers.PrimaryKeyRelatedField(queryset=MediaCreator.objects.all(), many=True)
    license = serializers.PrimaryKeyRelatedField(queryset=License.objects.all())

    def create(self, validated_data):
        print(validated_data)
        return {'sucess': True}


class SimpleIngestQueueSerializer(serializers.ModelSerializer):
    target = HAVTargetField()
    item_count = serializers.SerializerMethodField()

    def get_item_count(self, obj):
        return len(obj.selection)

    class Meta:
        model = IngestQueue
        fields = [
            'uuid',
            'target',
            'item_count',
            'created_at'
        ]


class IngestQueueSerializer(serializers.ModelSerializer):

    target = HAVTargetField()
    selection = serializers.ListField(child=IngestHyperlinkField())

    filtered_selection = serializers.SerializerMethodField()

    def get_filtered_selection(self, obj):
        filtered = []
        for source in obj.selection:
            target = resolveUrlToObject(source)
            if isinstance(target, Path) and target.is_file():
                filtered.append(source)
        return filtered

    def create(self, validated_data):
        logger.debug('creating queue: %s', validated_data)
        return IngestQueue.objects.create(**validated_data, created_by=self.context['request'].user)

    class Meta:
        model = IngestQueue
        fields = [
            'uuid',
            'target',
            'selection',
            'filtered_selection',
            'created_at'
        ]
