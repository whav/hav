from django.dispatch import receiver
from apps.media.models import Media
from apps.sets.models import Node
from django.db.models.signals import post_save
import django_rq
from .indexer.media import index as index_media
from .indexer.nodes import index as index_node


@receiver(post_save, sender=Media)
def media_update(sender, **kwargs):
    django_rq.enqueue(index_media, sender.pk)


@receiver(post_save, sender=Node)
def node_update(sender, **kwargs):
    django_rq.enqueue(index_node, sender.pk)
