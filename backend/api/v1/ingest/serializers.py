import os

from django.contrib.auth.models import User
from pathlib import Path
from rest_framework import serializers

from apps.media.models import MediaToCreator, MediaCreatorRole, Media, MediaCreator, License
from apps.media.utils.dtrange import range_from_partial_date
from apps.sets.models import Node
from apps.archive.operations.hash import generate_hash
from apps.archive.models import ArchiveFile
from apps.archive.tasks import archive
from apps.archive.operations.hash import generate_hash
from apps.ingest.models import IngestQueue

from psycopg2.extras import DateTimeTZRange

from .fields import HAVTargetField, IngestHyperlinkField, FinalIngestHyperlinkField, \
    InternalIngestHyperlinkField, resolveUrlToObject

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


class IngestionItemSerializer(serializers.Serializer):

    path = serializers.ListField(serializers.CharField(max_length=200))

    item = FinalIngestHyperlinkField()


class PrepareIngestSerializer(serializers.Serializer):

    target = HAVTargetField()

    items = serializers.ListField(
        child=IngestHyperlinkField()
    )


class IngestSerializer(serializers.Serializer):

    source = InternalIngestHyperlinkField()
    start = serializers.DateTimeField()
    end = serializers.DateTimeField()
    creators = serializers.PrimaryKeyRelatedField(queryset=MediaCreator.objects.all(), many=True)
    license = serializers.PrimaryKeyRelatedField(queryset=License.objects.all())

    def validate_source(self, value):
        hash = generate_hash(value)
        try:
            ArchiveFile.objects.get(hash=hash)
            raise serializers.ValidationError("A file with the hash %s is already archived." % hash)
        except ArchiveFile.DoesNotExist:
            return value

    def validate(self, data):
        if data['start'] > data['end']:
            raise serializers.ValidationError("Start time mus be before end time")
        return data


    def create(self, validated_data):
        user = self.context['user']
        target = self.context['target']
        dt_range = DateTimeTZRange(lower=validated_data['start'], upper=validated_data['end'])

        # actually create the media object
        media = Media.objects.create(
            creation_date=dt_range,
            license=validated_data.get('license'),
            set=target,
            created_by=user
        )

        # save m2m
        for creator in validated_data['creators']:
            MediaToCreator.objects.create(
                creator=creator,
                media=media
            )
        # trigger the archiving task
        archive.delay(str(validated_data['source']), media.pk, user.pk)

        return media


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
