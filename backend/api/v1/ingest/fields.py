import logging
from pathlib import Path
from urllib.parse import urlparse, unquote

from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.urls import resolve
from rest_framework import serializers
from rest_framework.reverse import reverse

from apps.sets.models import Node
from apps.whav.models import ImageCollection, MediaOrdering

logger = logging.getLogger(__name__)


class IngestHyperlinkField(serializers.Field):

    default_error_messages = serializers.HyperlinkedRelatedField.default_error_messages

    def get_url(self, obj, *args):

        url_name = 'api:v1:whav_browser:{}'
        reverse_kwargs = {
            'request': self.context['request']
        }
        if isinstance(obj, MediaOrdering):
            return reverse(
                url_name.format('whav_media'),
                kwargs={
                    'mediaordering_id': obj.pk
                },
                **reverse_kwargs
            )
        elif isinstance(obj, ImageCollection):
            return reverse(
                url_name.format('whav_collection'),
                kwargs={
                    'collection_id': obj.pk
                },
                **reverse_kwargs

            )
        elif isinstance(obj, Path):
            path = Path(unquote(str(obj)))

            if not path.exists():
                self.fail('no_match')

            is_file = path.is_file()
            
            url_name = 'api:v1:fs_browser:{}'

            if path.is_absolute():
                path = obj.relative_to(settings.INCOMING_FILES_ROOT)

            kwargs = {'path': str(path)}

            if is_file:
                return reverse(
                    url_name.format('filebrowser_file'),
                    kwargs=kwargs,
                    **reverse_kwargs
                )
            else:
                return reverse(
                    url_name.format('filebrowser'),
                    kwargs=kwargs,
                    **reverse_kwargs
               )

        self.fail('no_match')


    def get_object(self, url):
        path = urlparse(url).path
        match = resolve(path)
        print(match)
        # whav ingestion
        if match.view_name == 'api:v1:whav_media':
            return MediaOrdering.objects.get(pk=match.kwargs['mediaordering_id'])
        elif match.view_name == 'api:v1:whav_collection':
            return ImageCollection.objects.get(pk=match.kwargs['collection_id'])

        # deal with filebrowsers
        elif match.view_name in ['api:v1:filebrowser_file', 'api:v1:filebrowser']:
            return Path(settings.INCOMING_FILES_ROOT).joinpath(match.kwargs['path'])
        return self.fail('no_match')

    def to_internal_value(self, url):
        try:
            obj = self.get_object(url)
            logger.debug('Resolved url %s to file/db-entry %s', url, obj)
        except ObjectDoesNotExist:
            self.fail('does_not_exist')

        return url

    def to_representation(self, value):
        return value


class IngestionReferenceField(serializers.Field):

    def get_file_path(self, url):
        path = urlparse(url).path
        match = resolve(path)
        config = match.func.view_initkwargs.get('source_config')
        return config.to_fs_path(*match.args, **match.kwargs)

    def to_internal_value(self, data):
        # TODO: Error handling
        p = self.get_file_path(data)
        return data


class FinalIngestHyperlinkField(IngestHyperlinkField):
    '''
    Same as IngestHyperlinkField, but limits valid selections to
    whav media entries and real files
    '''
    def get_url(self, obj):
        if isinstance(obj, ImageCollection):
            self.fail('no_match')

        if isinstance(obj, Path) and obj.is_dir():
            self.fail('no_match')

        return super().get_url(obj)

    def get_object(self, *args, **kwargs):
        obj = super().get_object(*args, **kwargs)
        if isinstance(obj, ImageCollection):
            self.fail('does_not_exist')

        if isinstance(obj, Path) and obj.is_dir():
            self.fail('does_not_exist')

        return obj


class InternalIngestHyperlinkField(IngestionReferenceField):

    def to_internal_value(self, url):
        path = self.get_file_path(url)
        if not path.is_file():
            self.fail('does_not_exist')
        return path


class HAVTargetField(serializers.HyperlinkedRelatedField):
    view_name = 'api:v1:hav_browser:hav_set'
    queryset = Node.objects.all()


ingestField = IngestHyperlinkField()

def resolveUrlToObject(url):
    return ingestField.get_object(url)
