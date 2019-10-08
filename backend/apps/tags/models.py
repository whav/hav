import uuid
from django.db import models
from django.db.models import Q
from apps.hav_collections.models import Collection
from model_utils.managers import InheritanceManager
from .sources import TAG_LABEL_TO_SOURCE, TAGGING_SOURCE_CHOICES
from django.conf import settings


class Tag(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    name = models.CharField(max_length=200)
    objects = InheritanceManager()

    def __str__(self):
        return self.name

    class Meta:
        ordering = ('name', )


def get_tags_for_collection(collection):
    if isinstance(collection, Collection):
        collection = collection.pk

    # brain dump
    # Tag.objects.annotate(
    #   mc=Count('media'),
    #   cc=Count('node'),
    #   tc=F('mc') + F('cc')
    # ).filter(tc__gt=0)
    # .select_subclasses()

    return Tag.objects.filter(
        Q(
            Q(collectiontag__isnull=False) &
            Q(collectiontag__collection=collection))
        |
        Q(
            managedtag__isnull=False
        )
    )

class CollectionTag(Tag):
    collection = models.ForeignKey(Collection, on_delete=models.PROTECT)


class ManagedTag(Tag):

    SOURCE_CHOICES = TAGGING_SOURCE_CHOICES

    # these 2 fields are used to link to external sources
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, db_index=True)
    source_ref = models.CharField(max_length=20, db_index=True)

    def __str__(self):
        return f'{self.name} ({self.source})'

    def resolve(self):
        source = TAG_LABEL_TO_SOURCE[self.source]
        return source.get(self.source_ref)

    class Meta:
        unique_together = [
            ('source', 'source_ref')
        ]


def search_managed_tags(query):
    for source_key, source in TAG_LABEL_TO_SOURCE.items():
        results = source.search(query)
        if isinstance(results, (map, filter)):
            results = list(results)
        print(source_key, ': ', results)


def find_tags(query, collection=None):
    base_qs = Tag.objects.filter(name__icontains=query)
    return base_qs


def create_tag_from_source_key(value):
    source_key, source_id = value.split('||')
    source = TAG_LABEL_TO_SOURCE[source_key]
    print(source.get(source_id))

