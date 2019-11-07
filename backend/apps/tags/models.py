import uuid
from django.db import models
from apps.hav_collections.models import Collection
from .sources import TAG_LABEL_TO_SOURCE, TAGGING_SOURCE_CHOICES
from .fields import TagSourceChoiceField


class TagSource(models.Model):

    SOURCE_CHOICES = TAGGING_SOURCE_CHOICES

    # these 2 fields are used to link to external sources
    source = TagSourceChoiceField(blank=False)
    source_ref = models.CharField(max_length=50, db_index=True)

    def __str__(self):
        return f"{self.name} ({self.source})"

    def resolve(self):
        source = TAG_LABEL_TO_SOURCE[self.source]
        return source.get(self.source_ref)

    class Meta:
        unique_together = [("source", "source_ref")]


class Tag(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    collection = models.ForeignKey(Collection, on_delete=models.PROTECT)

    name = models.CharField(max_length=200)

    # currently a tag can have only one source
    # we might want to change this in the future to support all possible
    # SKOS relations
    source = models.ForeignKey(
        TagSource, blank=True, null=True, on_delete=models.PROTECT
    )

    def __str__(self):
        return self.name

    class Meta:
        ordering = ("name",)
