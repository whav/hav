from django.db import models
from django.contrib.postgres.fields import DateTimeRangeField
from django.conf import settings

from apps.sets.models import Node
from apps.archive.models import ArchiveFile

from .types import media_types

class MediaCreator(models.Model):
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100)
    display_name = models.CharField(max_length=200, blank=True)

    def __str__(self):

        if self.display_name:
            return self.display_name

        return "{0}{1}".format(
            self.last_name,
            ", {0}".format(self.first_name) if self.first_name else ''
        )


class MediaCreatorRole(models.Model):

    role_name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.role_name


class MediaToCreator(models.Model):
    creator = models.ForeignKey(MediaCreator, on_delete=models.CASCADE)
    role = models.ForeignKey(MediaCreatorRole, null=True, on_delete=models.SET_NULL)
    media = models.ForeignKey('Media', on_delete=models.CASCADE)

    class Meta:
        unique_together = [
            ('creator', 'role', 'media')
        ]


class License(models.Model):
    name = models.CharField(max_length=100)
    short_name = models.CharField(max_length=10, unique=True)

    def __str__(self):
        return self.short_name


class MediaManager(models.Manager):

    def create_media(self, creators=[], **kwargs):
        media = self.create(**kwargs)
        for c in creators:
            MediaToCreator.objects.create(
                creator=c,
                media=media
            )
        return media


class Media(models.Model):

    MEDIA_TYPE_CHOICES = media_types

    creators = models.ManyToManyField(MediaCreator, through=MediaToCreator, verbose_name='creators')
    creation_date = DateTimeRangeField()
    license = models.ForeignKey(License, null=True, on_delete=models.SET_NULL)

    original_media_type = models.IntegerField(choices=MEDIA_TYPE_CHOICES, default=1)
    original_media_description = models.TextField(blank=True)
    original_media_identifier = models.CharField(blank=True, max_length=200)

    set = models.ForeignKey(Node, on_delete=models.PROTECT)

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='created_media')
    modified_at = models.DateTimeField(auto_now=True, null=True)
    modified_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.PROTECT, related_name='modified_media')

    files = models.ManyToManyField(ArchiveFile)

    objects = MediaManager()



