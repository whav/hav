import django_rq
from django.db.models.signals import post_save
from django.dispatch import receiver

from ..media.models import Media
from ..sets.models import Node
from .client import get_index as get_search_index
from .utils import update_document_in_index


@receiver(post_save, sender=Media)
def media_update(sender, instance, **kwargs):
    django_rq.enqueue(update_document_in_index, instance.pk, sender, get_search_index())


@receiver(post_save, sender=Node)
def node_update(sender, instance, **kwargs):
    django_rq.enqueue(update_document_in_index, instance.pk, sender, get_search_index())
