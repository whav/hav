from typing import Optional

from django.db import models
from django.db.models import F
from django.db.models.functions import Lower
from django.utils.functional import cached_property

from treebeard.mp_tree import MP_Node
from itertools import chain


class Node(MP_Node):
    class DisplayOptions(models.TextChoices):
        DEFAULT = "", "Default"
        GROUPED_CREATION_DATE = "grouped_creation_day", "Grouped by date"
        GROUPED_TITLE = "grouped_title", "Grouped by media title"

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    tags = models.ManyToManyField("tags.Tag", blank=True)

    display_type = models.CharField(
        max_length=20,
        db_index=True,
        choices=DisplayOptions.choices,
        blank=True,
        default=DisplayOptions.DEFAULT,
    )

    representative_media = models.ForeignKey(
        "media.Media",
        on_delete=models.SET_NULL,
        default=None,
        null=True,
        blank=True,
    )

    @property
    def children(self):
        return self.get_children()

    @property
    def collection_ancestors(self):
        root_node_id = self.get_collection().root_node_id
        if self.pk == root_node_id:
            # we are the actual node!
            return []

        ancestors = self.get_ancestors()
        for index, ancestor in enumerate(ancestors):
            if ancestor.pk == root_node_id:
                return ancestors[index + 1 :]

        return ancestors

    def get_collection(self):
        from apps.hav_collections.models import Collection

        try:
            return self.collection
        except Collection.DoesNotExist:
            ancestor = self.get_ancestors().filter(collection__isnull=False).last()
            if ancestor is None:
                return None
            else:
                return ancestor.collection

    @classmethod
    def get_collection_roots(cls):
        return cls._default_manager.filter(collection__isnull=False)

    @property
    def inherited_tags(self):
        from apps.tags.models import Tag

        qs = Tag.objects.filter(node__in=self.get_ancestors()).order_by("node__depth")
        return qs

    def get_representative_media(self) -> Optional["apps.media.models"]:
        if self.representative_media:
            return self.representative_media

        from apps.media.models import Media

        descendant_iterator = chain([self], self.get_descendants().iterator())
        for node in descendant_iterator:
            try:
                # attempt to get the first media entry
                return Media.objects.publicly_available().filter(set=node)[0]
            except IndexError:
                continue

    def __str__(self):
        return self.name


def group_media_queryset(qs, display_type=Node.DisplayOptions.DEFAULT):
    dtypes = Node.DisplayOptions
    if display_type == dtypes.GROUPED_TITLE:
        qs = qs.order_by("title").annotate(grouper=F("title"))
    elif display_type == dtypes.GROUPED_CREATION_DATE:
        qs = qs.order_by(Lower("creation_date")).annotate(
            grouper=Lower("creation_date")
        )
    return qs
