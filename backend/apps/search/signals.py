from django.dispatch import receiver
from apps.media.models import Media
from apps.sets.models import Node
from django.db.models.signals import post_save


@receiver(post_save, sender=Media)
def media_update(sender, **kwargs):
    print('Media was saved.', sender)


@receiver(post_save, sender=Node)
def node_update(sender, **kwargs):
    print('Node was saved.', sender)
