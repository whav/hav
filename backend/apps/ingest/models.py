import uuid

from django.db import models
from django.contrib.postgres.fields import ArrayField, JSONField, HStoreField
from django.conf import settings

from apps.sets.models import Node

class IngestQueue(models.Model):

    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    target = models.ForeignKey(Node, null=True, on_delete=models.SET_NULL)

    selection = ArrayField(models.URLField(), default=list)
    expanded_selection = ArrayField(models.URLField(), default=list)

    ingested_items = HStoreField(default=dict)

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    ready_for_ingestion = models.BooleanField(default=False)
    ingested = models.DateTimeField(null=True, default=None)

    data = JSONField(default=dict)

    def __str__(self):
        return str(self.pk)

    @property
    def selection_length(self):
        return len(self.selection)