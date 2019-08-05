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
from apps.media.models import MediaToCreator, MediaCreatorRole, Media, License, MediaType
from .fields import HAVTargetField, IngestHyperlinkField, FinalIngestHyperlinkField, \
    InternalIngestHyperlinkField, IngestionReferenceField
from hav_utils.daterange import parse
from .ingest_task import archive_and_create_webassets

logger = logging.getLogger(__name__)


class MediaLicenseSerializer(serializers.ModelSerializer):

    class Meta:
        model = License
        fields = [
            'id',
            'name'
        ]

class MediaTypeSerializer(serializers.ModelSerializer):

    name = serializers.SerializerMethodField()

    def get_name(self, obj):
        return str(obj)

    class Meta:
        model = MediaType
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


def validate_source_path(source_path):
    try:
        hash_value = generate_hash(source_path)
    except FileNotFoundError:
        raise serializers.ValidationError(f"The file {path} could not be found.")

    try:
        media = Media.objects.get(files__hash=hash_value)
        raise serializers.ValidationError(f"A file with the hash '{hash_value}' is already archived. Check media {media}.")
    except Media.DoesNotExist:
        pass


class AttachmentSerializer(serializers.ModelSerializer):
    source = IngestionReferenceField()
    creators = MediaCreatorSerializer(many=True, allow_empty=False)

    # def validate_source(self, path):
    #     print(path)
    #     validate_source_path(path)
    #     return path

    class Meta:
        model = AttachmentFile
        fields = ('source', 'creators')



class IngestSerializer(serializers.Serializer):

    sources = serializers.ListField(child=IngestionReferenceField(), min_length=1)
    target = serializers.HyperlinkedRelatedField(view_name='api:v1:hav_browser:hav_set', queryset=Node.objects.all(), required=False)

    date = serializers.CharField()

    creators = MediaCreatorSerializer(many=True, allow_empty=False)

    media_license = serializers.PrimaryKeyRelatedField(queryset=License.objects.all())
    media_title = serializers.CharField(max_length=255)
    media_type = serializers.PrimaryKeyRelatedField(queryset=MediaType.objects.all())
    media_description = serializers.CharField(allow_blank=True, required=False)
    media_identifier = serializers.CharField(allow_blank=True, required=False)
    media_tags = serializers.ListField(child=serializers.CharField(max_length=255), required=False)

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


    # def validate_sources(self, sources):
    #     errors = {}
    #     for key, path in zip(self.initial_data['sources'], sources):
    #         try:
    #             validate_source_path(path)
    #         except serializers.ValidationError as e:
    #             errors.update({key: e.detail})
    #     if errors:
    #         # TODO: we could raise this dict directly, but the frontend has no idea what to do with it
    #         raise serializers.ValidationError(_transform_error_dict(errors))
    #     return sources

    def validate(self, data):
        user = self.context['user']
        target = data.get('target') or self.context['target']
        collection = target.get_collection()
        if not user.is_superuser or user not in collection.administrators.all():
            raise serializers.ValidationError(
                'You do not have the appropriate permissions to ingest into the collection "{}"'
                .format(target.collection.name)
            )

        if not target.is_descendant_of(collection.root_node) and not target == collection.root_node:
            raise serializers.ValidationError("Target set is not a descendant of the specified collection.")

        return data


    @transaction.atomic
    def create(self, validated_data):
        user = self.context['user']
        sources = self.initial_data['sources']

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
            tags=validated_data.get('media_tags', []),
            original_media_type=validated_data['media_type'],
            original_media_identifier=validated_data.get('media_identifier', '')
        )

        # save m2m
        for media2creator in validated_data['creators']:
            MediaToCreator.objects.create(media=media, **media2creator)

        archived_files = []
        for source_id in validated_data['sources']:
            af = ArchiveFile.objects.create(
                source_id=source_id,
                created_by=user,
                media=media
            )
            archived_files.append(af)

        media.files.set(archived_files)

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
        if (queue):
            queue = IngestQueue.objects.select_for_update().get(pk=queue.pk)
            for source in sources:
                queue.link_to_media(media, source)
            queue.save()

        logger.info(
            "Triggering archiving for %d file(s) %s; media: %d; user: %d",
            len(validated_data['sources']),
            ', '.join([str(s) for s in validated_data['sources']]),
            media.pk,
            user.pk
        )

        archive_ids = [a.pk for a in chain(archived_files, attachments)]

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

    selection = serializers.ListField(child=IngestionReferenceField(), write_only=True)

    created_media_entries = serializers.SerializerMethodField()

    related_files = serializers.SerializerMethodField()
    initial_data = serializers.SerializerMethodField()

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
            'selection',
            'ingestion_queue',
            'initial_data',
            'related_files',
            'created_media_entries'
        ]
