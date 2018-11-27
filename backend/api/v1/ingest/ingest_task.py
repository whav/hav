
from django_rq import get_queue
from apps.archive.tasks import archive
from apps.webassets.tasks import create_webassets_after_archive_task as create_webassets

from channels.layers import get_channel_layer

channel_layer = get_channel_layer()

from asgiref.sync import async_to_sync




def archive_and_create_webassets(filename, media_id, user_id, channel_group='ingest'):

    def send_progress(msg):
        async_to_sync(channel_layer.group_send)(channel_group, {"type": "ingest.progress", "msg": msg})

    send_progress("started")
    archive_queue = get_queue('archive')
    webasset_queue = get_queue('webassets')
    archive_job = archive_queue.enqueue(
        archive,
        filename,
        media_id,
        user_id,
        result_ttl=3600*72,
        timeout=600
    )
    send_progress("archive job queued")

    webasset_job = webasset_queue.enqueue(
        create_webassets,
        depends_on=archive_job,
        timeout=3600*5
    )
    send_progress("webasset job queued")

    return archive_job, webasset_job
