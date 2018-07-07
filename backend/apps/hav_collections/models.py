from django.db import models
from django.conf import settings

from apps.sets.models import Node


def root_nodes():
    return Node.get_root_nodes()


class Collection(models.Model):

    slug = models.SlugField()
    name = models.CharField(unique=True, max_length=200)
    short_name = models.CharField(unique=True, max_length=30, blank=True)

    administrators = models.ManyToManyField(settings.AUTH_USER_MODEL)

    root_node = models.OneToOneField(
        Node,
        null=True,
        on_delete=models.PROTECT,
        limit_choices_to=root_nodes,
        unique=True
    )

    def __str__(self):
        return self.slug()

