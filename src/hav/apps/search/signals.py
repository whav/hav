from django.dispatch import receiver
from ..media.models import Media
from ..sets.models import Node
from django.db.models.signals import post_save
import django_rq
from .indexer.media import index as index_media
from .indexer.nodes import index as index_node


@receiver(post_save, sender=Media)
def media_update(sender, instance, **kwargs):
    django_rq.enqueue(index_media, instance.pk)


@receiver(post_save, sender=Node)
def node_update(sender, instance, **kwargs):
    django_rq.enqueue(index_node, instance.pk)
