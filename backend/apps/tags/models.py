from django.db import models
from apps.hav_collections.models import Collection
from model_utils.managers import InheritanceManager
from .sources import TAG_LABEL_TO_SOURCE


class Tag(models.Model):

    name = models.CharField(max_length=200)
    objects = InheritanceManager()

    def __str__(self):
        return self.name

    class Meta:
        ordering = ('name', )


class CollectionTag(Tag):
    collection = models.ForeignKey(Collection, on_delete=models.PROTECT)

    class Meta:
        ordering = ('pk', )

class ManagedTag(Tag):

    # these 2 fields are used to link to external sources
    source = models.CharField(max_length=20, db_index=True)
    source_ref = models.CharField(max_length=20, db_index=True)

    def __str__(self):
        return f'{self.source}: {self.name}'

    def resolve(self):
        source = TAG_LABEL_TO_SOURCE[self.source]
        return source.get(self.source_ref)

    class Meta:
        unique_together = [
            ('source', 'source_ref')
        ]
        ordering = ('pk',)

