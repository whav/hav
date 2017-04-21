from collections import namedtuple

from django.db import models
from django.contrib.postgres.fields import JSONField

from hav.utils.storages import getStorage

example_storage = getStorage('examples')

MediaType = namedtuple('MediaType', ['name'])

PRIMARY_MEDIA_TYPES = [
    MediaType('image'),
    MediaType('audio'),
    MediaType('video')
]

class Media(models.Model):

    type = models.CharField(
        choices=[(mt.name, mt.name) for mt in PRIMARY_MEDIA_TYPES],
        db_index=True,
        max_length=10
    )

    meta = JSONField(blank=True, null=True)

    class Meta:
        verbose_name_plural = 'Example Media'


class FileAttachment(models.Model):
    file = models.FileField(storage=example_storage)
    original_filename = models.CharField(max_length=200, blank=True)
    meta = JSONField(null=True, blank=True)
    primary = models.BooleanField(default=False)
    media = models.ForeignKey(Media, null=True)