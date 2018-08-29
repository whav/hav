import uuid

from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.conf import settings

from apps.sets.models import Node
from apps.media.models import Media


class IngestQueue(models.Model):

    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    name = models.CharField(max_length=100, blank=True)

    target = models.ForeignKey(Node, null=True, on_delete=models.SET_NULL)

    ingestion_queue = ArrayField(models.URLField(max_length=200), default=list)

    created_media_entries = models.ManyToManyField(Media, blank=True, editable=False)

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    @property
    def ingestion_queue_length(self):
        return len(self.ingestion_queue)

    def add_items(self, items):
        self.ingestion_queue.extend(items)
        self.ingestion_queue = list(set(self.ingestion_queue))

    def delete_item(self, item):
        self.ingestion_queue.remove(item)

    def link_to_media(self, media, item):
        self.delete_item(item)
        self.created_media_entries.add(media)

    def __str__(self):
        return str(self.pk)

    @property
    def selection_length(self):
        return len(self.selection)