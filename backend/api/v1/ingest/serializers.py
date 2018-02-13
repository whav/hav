import logging

from django.db import transaction
from psycopg2.extras import DateTimeTZRange
from rest_framework import serializers

from apps.archive.models import ArchiveFile
from apps.archive.operations.hash import generate_hash
from apps.archive.tasks import archive
from apps.ingest.models import IngestQueue
from apps.media.models import MediaToCreator, MediaCreatorRole, Media, MediaCreator, License
from .fields import HAVTargetField, IngestHyperlinkField, FinalIngestHyperlinkField, \
    InternalIngestHyperlinkField, IngestionReferenceField

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

    media_type = serializers.ChoiceField(choices=Media.MEDIA_TYPE_CHOICES)
    media_description = serializers.CharField(allow_blank=True, required=False)
    media_identifier = serializers.CharField(allow_blank=True, required=False)

    def validate_source(self, value):
        try:
            hash = generate_hash(value)
        except FileNotFoundError:
            raise serializers.ValidationError("The file could not be found.")

        try:
            ArchiveFile.objects.get(hash=hash)
            raise serializers.ValidationError("A file with the hash %s is already archived." % hash)
        except ArchiveFile.DoesNotExist:
            return value

    def validate(self, data):
        if data['start'] > data['end']:
            raise serializers.ValidationError("Start time must be before end time.")
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
            created_by=user,
            original_media_type=validated_data['media_type'],
            original_media_description=validated_data.get('media_description', ''),
            original_media_identifier=validated_data.get('media_identifier', '')
        )

        # save m2m
        for creator in validated_data['creators']:
            MediaToCreator.objects.create(
                creator=creator,
                media=media
            )

        logger.info(
            "Triggering archiving for file %s, media: %d, user: %d",
            str(validated_data['source']),
            media.pk,
            user.pk
        )

        # this instructs django to execute the function after any commit
        transaction.on_commit(lambda: archive.delay(str(validated_data['source']), media.pk, user.pk))

        return media


class SimpleIngestQueueSerializer(serializers.ModelSerializer):
    target = HAVTargetField()

    item_count = serializers.SerializerMethodField()
    ingested_item_count = serializers.SerializerMethodField()

    def get_item_count(self, obj):
        return len(obj.ingestion_items)

    def get_ingested_item_count(self, obj):
        return len(obj.ingested_items)

    class Meta:
        model = IngestQueue
        fields = [
            'uuid',
            'target',
            'item_count',
            'ingested_item_count',
            # 'ingestion_',
            'created_at'
        ]


class IngestQueueSerializer(serializers.ModelSerializer):

    target = HAVTargetField()

    selection = serializers.ListField(child=IngestionReferenceField(), write_only=True)

    def create(self, validated_data):
        logger.debug('creating queue: %s', validated_data)
        q = IngestQueue(
            target=validated_data['target'],
            created_by=self.context['request'].user
        )
        q.add_items(validated_data['selection'])
        q.save(force_insert=True)
        return q

    class Meta:
        model = IngestQueue
        fields = [
            'uuid',
            'target',
            'selection',
            'ingestion_items',
            'ingested_items'
        ]
