from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.core.exceptions import ObjectDoesNotExist
from apps.media.models import Media
from logging import getLogger
from urllib.parse import urljoin

logger = getLogger(__name__)


def send_task_status(media):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "media",
        {
            "type": "media.task_update",
            "media_id": media.pk
        })

def archive_finished(archive_id):
    try:
        media = Media.objects.get(files__pk=archive_id)
    except ObjectDoesNotExist as e:
        logger.error(e)
    else:
        send_task_status(media)

def webassets_created(webasset_id):
    try:
        media = Media.objects.get(files__webasset__pk=webasset_id)
    except ObjectDoesNotExist as e:
        logger.error(e)
    else:
        send_task_status(media)
