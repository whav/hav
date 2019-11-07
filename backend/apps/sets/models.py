from django.db import models
from treebeard.mp_tree import MP_Node


class Node(MP_Node):

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    tags = models.ManyToManyField("tags.Tag")

    @property
    def children(self):
        return self.get_children()

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

    def __str__(self):
        return self.name


#
