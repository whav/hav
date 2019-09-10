import logging
from itertools import chain
from django.db import transaction
from psycopg2.extras import DateTimeTZRange
from rest_framework import serializers
from django.urls import reverse


from api.v1.havBrowser.serializers import HAVMediaSerializer

from apps.archive.operations.hash import generate_hash
from apps.ingest.models import IngestQueue
from apps.sets.models import Node
from apps.archive.models import AttachmentFile, ArchiveFile, FileCreator
from apps.media.models import MediaToCreator, MediaCreatorRole, Media, License, MediaType, MediaCreator
from apps.tags.models import Tag
from .fields import HAVTargetField, IngestHyperlinkField, FinalIngestHyperlinkField, \
    IngestionReferenceField
from hav_utils.daterange import parse
from ..havBrowser.serializers import HAVCollectionSerializer
from .ingest_task import archive_and_create_webassets
from .fields import resolveURLtoFilePath
from ..permissions import has_collection_permission

logger = logging.getLogger(__name__)


class MediaToCreatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaToCreator
        fields = ['id', 'creator', 'role']


class FileToCreatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileCreator
        fields = ['id', 'creator', 'role']



class IngestionItemSerializer(serializers.Serializer):

    path = serializers.ListField(serializers.CharField(max_length=200))

    item = FinalIngestHyperlinkField()


class PrepareIngestSerializer(serializers.Serializer):

    target = HAVTargetField()

    items = serializers.ListField(
        child=IngestHyperlinkField()
    )


def _transform_error_dict(errors):
    values = errors.values()
    return ' '.join(map(lambda x: ' '.join([str(e) for e in x]), values))


def validate_source(url):
    source_path = resolveURLtoFilePath(url)
    try:
        hash_value = generate_hash(source_path)
    except FileNotFoundError:
        raise serializers.ValidationError(f"The file {source_path} could not be found.")

    try:
        media = Media.objects.get(files__hash=hash_value)
        raise serializers.ValidationError(f"A file with the hash '{hash_value}' is already archived. Check media {media}.")
    except Media.DoesNotExist:
        pass


class AttachmentSerializer(serializers.ModelSerializer):
    source = IngestionReferenceField()
    creators = FileToCreatorSerializer(many=True, allow_empty=False)

    def validate_source(self, source_id):
        validate_source(source_id)
        return source_id

    class Meta:
        model = AttachmentFile
        fields = ('source', 'creators')



class IngestSerializer(serializers.Serializer):

    source = IngestionReferenceField()
    target = serializers.HyperlinkedRelatedField(view_name='api:v1:hav_browser:hav_set', queryset=Node.objects.all(), required=False)

    date = serializers.CharField()

    creators = MediaToCreatorSerializer(many=True, allow_empty=False)

    media_license = serializers.PrimaryKeyRelatedField(queryset=License.objects.all())
    media_title = serializers.CharField(max_length=255)
    media_type = serializers.PrimaryKeyRelatedField(queryset=MediaType.objects.all())
    media_description = serializers.CharField(allow_blank=True, required=False)
    media_identifier = serializers.CharField(allow_blank=True, required=False)
    media_tags = serializers.PrimaryKeyRelatedField(queryset=Tag.objects.all(), many=True, required=False)

    attachments = AttachmentSerializer(many=True, allow_empty=True)

    @property
    def target_node(self):
        return self.validated_data.get('target') or self.context['target']

    def validate_date(self, value):
        try:
            parse(value)
        except ValueError:
            raise serializers.ValidationError('Unable to parse value.')
        else:
            return value

    def validate_source(self, source):
        validate_source(source)
        return source

    def validate(self, data):
        user = self.context['user']
        target = data.get('target') or self.context['target']
        collection = target.get_collection()
        if not has_collection_permission(user, collection):
            raise serializers.ValidationError(
                'You do not have the appropriate permissions to ingest into the collection "{}"'
                .format(collection.name)
            )

        if not target.is_descendant_of(collection.root_node) and not target == collection.root_node:
            raise serializers.ValidationError("Target set is not a descendant of the specified collection.")

        return data


    @transaction.atomic
    def create(self, validated_data):
        user = self.context['user']
        source = validated_data['source']

        start, end = parse(validated_data['date'])
        dt_range = DateTimeTZRange(lower=start, upper=end)
        # actually create the media object
        media = Media.objects.create(
            creation_date=dt_range,
            license=validated_data.get('media_license'),
            title=validated_data.get('media_title', ''),
            description=validated_data.get('media_description', ''),
            set=self.target_node,
            collection=self.target_node.get_collection(),
            created_by=user,
            original_media_type=validated_data['media_type'],
            original_media_identifier=validated_data.get('media_identifier', '')
        )

        # save m2m
        for media2creator in validated_data['creators']:
            MediaToCreator.objects.create(media=media, **media2creator)

        # set tags
        media.tags.set(validated_data.get('media_tags', []))

        af = ArchiveFile.objects.create(
            source_id=source,
            created_by=user,
            media=media
        )

        media.files.set([af])

        attachments = []
        for attachment in validated_data['attachments']:
            af = AttachmentFile.objects.create(
                source_id=attachment['source'],
                created_by=user
            )
            for creator in attachment['creators']:
                FileCreator.objects.create(file=af, **creator)

            attachments.append(af)

        media.attachments.set(attachments)

        # update the ingest queue (if available) by removing the source
        queue = self.context.get('queue')
        if queue:
            queue = IngestQueue.objects.select_for_update().get(pk=queue.pk)
            queue.link_to_media(media, source)
            queue.save()

        archive_ids = [a.pk for a in chain([af], attachments)]

        logger.info(
            "Triggering archiving for %d file(s); media: %d; user: %d",
            len(archive_ids),
            media.pk,
            user.pk
        )


        def ingestion_trigger():
            return archive_and_create_webassets(
                archive_ids,
                media.pk,
                # these args are for websockets via channels
                self.context['channel']
            )

        # this instructs django to execute the function after any commit
        transaction.on_commit(ingestion_trigger)
        return media


class SimpleIngestQueueSerializer(serializers.ModelSerializer):
    target = HAVTargetField()

    item_count = serializers.SerializerMethodField()
    ingested_item_count = serializers.SerializerMethodField()

    def get_item_count(self, obj):
        return len(obj.ingestion_queue)

    def get_ingested_item_count(self, obj):
        return obj.created_media_entries.count()



    class Meta:
        model = IngestQueue
        fields = [
            'uuid',
            'target',
            'name',
            'item_count',
            'ingested_item_count',
            'created_at'
        ]


class SimpleMediaSerializer(HAVMediaSerializer):

    def get_url(self, instance):
        request = self.context.get('request')
        url_lookup = 'api:v1:hav_browser:hav_media'
        url_kwargs = {'pk': instance.pk}
        return request.build_absolute_uri(
            reverse(
                url_lookup,
                kwargs=url_kwargs
            )
        )


class IngestQueueSerializer(serializers.ModelSerializer):

    target = HAVTargetField()

    target_collection = serializers.SerializerMethodField()

    selection = serializers.ListField(child=IngestionReferenceField(), write_only=True)

    created_media_entries = serializers.SerializerMethodField()

    related_files = serializers.SerializerMethodField()
    initial_data = serializers.SerializerMethodField()

    def get_target_collection(self, obj):
        collection = obj.target.get_collection()
        return HAVCollectionSerializer(instance=collection, context=self.context).data

    def get_initial_data(self, obj):
        return {
            item: {} for item in obj.ingestion_queue
        }

    def get_related_files(self, obj):
        return {
            item: [] for item in obj.ingestion_queue
        }

    def get_created_media_entries(self, queue):
        return SimpleMediaSerializer(queue.created_media_entries.all(), many=True, context=self.context).data

    def create(self, validated_data):
        logger.debug('creating queue: %s', validated_data)
        q = IngestQueue(
            target=validated_data['target'],
            name=validated_data['name'],
            created_by=self.context['request'].user,
            ingestion_queue=validated_data['selection']
        )
        q.add_items(validated_data['selection'])
        q.save(force_insert=True)
        return q


    class Meta:
        model = IngestQueue
        fields = [
            'uuid',
            'name',
            'target',
            'target_collection',
            'selection',
            'ingestion_queue',
            'initial_data',
            'related_files',
            'created_media_entries'
        ]


