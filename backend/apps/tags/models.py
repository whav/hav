import uuid
from django.db import models
from apps.hav_collections.models import Collection
from .sources import TAG_LABEL_TO_SOURCE, search_tag_sources
from .fields import TagSourceChoiceField


class TagSource(models.Model):

    # these 2 fields are used to link to external sources
    source = TagSourceChoiceField(blank=False)
    source_ref = models.CharField(max_length=50, db_index=True)

    def __str__(self):
        return f"{self.source} ({self.source_ref})"

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

    @property
    def has_source(self):
        return bool(self.source)

    def to_search_result(self):
        from .sources import TagSourceResult

        source, source_ref = (
            (self.source.source, self.source.source_ref)
            if self.source
            else (None, None)
        )
        # TODO: pull in the crumbs from the source
        return TagSourceResult(
            id=str(self.pk), name=self.name, source=source, source_ref=source_ref
        )

    def __str__(self):
        return self.name

    class Meta:
        ordering = ("name",)
        unique_together = [("name", "collection")]


def search_tags(query, collection=None):
    # get tag source results
    source_results = search_tag_sources(query)

    tag_hits = Tag.objects.none()
    if collection:
        tag_hits = Tag.objects.select_related("source").filter(name__icontains=query)

    tag_hits = [tag.to_search_result() for tag in tag_hits]
    existing_source_refs = {(tag.source, tag.source_ref) for tag in tag_hits}
    source_results = filter(
        lambda result: (result.source, result.source_ref) not in existing_source_refs,
        source_results,
    )
    return [*tag_hits, *source_results]
