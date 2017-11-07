import os
from urllib.parse import urlparse, unquote
from pathlib import Path

from django.urls import resolve
from django.contrib.auth.models import User
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers
from rest_framework.reverse import reverse

from apps.media.models import MediaToCreator, MediaCreatorRole, Media, MediaCreator, License
from apps.media.utils.dtrange import range_from_partial_date
from apps.sets.models import Node
from apps.archive.tasks import archive
from apps.archive.operations.hash import generate_hash
from apps.archive.models import ArchiveFile

from apps.whav.models import Media, ImageCollection, MediaOrdering
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


class IngestHyperlinkField(serializers.Field):

    default_error_messages = serializers.HyperlinkedRelatedField.default_error_messages

    def get_url(self, obj, *args):

        url_name = 'api:v1:whav_browser:${}'

        if isinstance(obj, MediaOrdering):
            return reverse(
                url_name.format('whav_media'),
                kwargs={
                    'mediaordering_id': obj.pk
                }
            )
        elif isinstance(obj, ImageCollection):
            return reverse(
                url_name.format('whav_collection'),
                kwargs={
                    'collection_id': obj.pk
                }
            )
        elif isinstance(obj, Path):
            url_name = 'api:v1:fs_browser:${}'
            kwargs = {'path': str(obj)}
            if obj.is_file():
                return reverse(url_name.format('filebrowser_file'), kwargs=kwargs)
            else:
                return reverse(url_name.format('filebrowser'), kwargs=kwargs)

        self.fail('no_match')

    def get_object(self, view_name, view_args, view_kwargs):
        # whav ingestion
        if view_name == 'api:v1:whav_browser:whav_media':
            return MediaOrdering.objects.get(pk=view_kwargs['mediaordering_id'])
        elif view_name == 'api:v1:whav_browser:whav_collection':
            return ImageCollection.objects.get(pk=view_kwargs['collection_id'])
        # deal with filebrowsers
        elif view_name in ['api:v1:fs_browser:filebrowser_file', 'api:v1:fs_browser:filebrowser']:
            return Path(settings.INCOMING_FILES_ROOT).joinpath(view_kwargs['path'])

        return self.fail['']

    def to_internal_value(self, data):
        path = urlparse(data).path
        match = resolve(path)
        try:
            return self.get_object(match.view_name, match.args, match.kwargs)
        except ObjectDoesNotExist:
            self.fail('does_not_exist')

    def to_representation(self, value):
        return self.get_url(value)


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
        print(data)
        # self.validate_ingestion_identifier(data.get('ingestion_id'))
        self.validate_dates(data)
        return data


class SimpleMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = ['pk', 'creators', 'license', 'creation_date']


class HAVTargetField(serializers.HyperlinkedRelatedField):
    view_name = 'api:v1:hav_browser:hav_set'
    queryset = Node.objects.all()


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



class IngestSourcesSerializer():
    child = IngestHyperlinkField()


class PrepareIngestSerializer(serializers.Serializer):

    target = HAVTargetField()

    items = serializers.ListField(
        child=IngestHyperlinkField()
    )

