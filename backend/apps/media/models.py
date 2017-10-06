import uuid

from django.db import models
from django.contrib.postgres.fields import DateTimeRangeField

from apps.sets.models import Node
from apps.archive.models import ArchiveFile


class MediaCreator(models.Model):
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100)
    display_name = models.CharField(max_length=200, blank=True)

    def ___str__(self):

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
    role = models.ForeignKey(MediaCreatorRole, on_delete=models.CASCADE)


class License(models.Model):
    name = models.CharField(max_length=100)
    short_name = models.CharField(max_length=10, unique=True)


class Media(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    archive_file = models.OneToOneField(ArchiveFile, on_delete=models.PROTECT)
    creators = models.ManyToManyField(through=MediaToCreator, verbose_name='creators')
    creation_date = DateTimeRangeField()
    license = models.ForeignKey(License, null=True, on_delete=models.SET_NULL)

    set = models.ForeignKey(Node, on_delete=models.PROTECT)