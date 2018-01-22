
from urllib.parse import urlparse, unquote
from pathlib import Path

from django.urls import resolve
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers
from rest_framework.reverse import reverse

from apps.whav.models import ImageCollection, MediaOrdering
from apps.sets.models import Node

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


    def get_object(self, view_name, view_args, view_kwargs):
        # whav ingestion
        if view_name == 'api:v1:whav_browser:whav_media':
            return MediaOrdering.objects.get(pk=view_kwargs['mediaordering_id'])
        elif view_name == 'api:v1:whav_browser:whav_collection':
            return ImageCollection.objects.get(pk=view_kwargs['collection_id'])

        # deal with filebrowsers
        elif view_name in ['api:v1:fs_browser:filebrowser_file', 'api:v1:fs_browser:filebrowser']:
            return Path(settings.INCOMING_FILES_ROOT).joinpath(view_kwargs['path'])
        return self.fail('no_match')

    def to_internal_value(self, url):
        path = urlparse(url).path
        match = resolve(path)
        try:
            return self.get_object(match.view_name, match.args, match.kwargs)
        except ObjectDoesNotExist:
            self.fail('does_not_exist')

    def to_representation(self, value):
        return self.get_url(value)


class StoredIngestHyperlinkField(IngestHyperlinkField):
    def to_internal_value(self, data):
        iv = super().to_internal_value(data)
        return iv


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


class HAVTargetField(serializers.HyperlinkedRelatedField):
    view_name = 'api:v1:hav_browser:hav_set'
    queryset = Node.objects.all()

