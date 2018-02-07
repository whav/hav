import uuid

from django.db import models
from django.contrib.postgres.fields import JSONField
from django.conf import settings

from apps.sets.models import Node


class IngestQueue(models.Model):

    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    target = models.ForeignKey(Node, null=True, on_delete=models.SET_NULL)

    ingestion_items = JSONField(default=dict)

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)


    @property
    def ingested_items(self):
        items = []
        for k in self.ingestion_items.keys():
            if self.ingestion_items[k] is None:
                items.append(k)
        return items


    def add_items(self, items):
        self.ingestion_items.update({
            i: None for i in items
        })

    def delete_item(self, item):
        del self.ingestion_items[item]

    def __str__(self):
        return str(self.pk)

    @property
    def selection_length(self):
        return len(self.selection)