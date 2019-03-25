from channels.layers import get_channel_layer
from django_rq import get_queue
from asgiref.sync import async_to_sync

from apps.archive.tasks import archive
from apps.webassets.tasks import create_webassets_after_archive_task as create_webassets

channel_layer = get_channel_layer()


def send_progress(msg, media_id, channel_group):
    async_to_sync(channel_layer.group_send)(
        channel_group,
        {
            "type": "ingest.progress",
            "msg": msg,
            "media_id": media_id
        })


def archive_and_create_webassets(filenames, media_id, user_id, channel_group):
    # TODO: untangle task updates from processing logic
    # perhaps using a closure or similar

    progress_args = [media_id, channel_group]

    archive_queue = get_queue('archive')
    webasset_queue = get_queue('webassets')
    notification_queue = get_queue('default')

    task_status = [
        {
            "task": "archiving",
            "status": "pending"
        },
        {
            "task": "webassets",
            "status": "pending"
        }
    ]

    notification_queue.enqueue(
        send_progress,
        task_status.copy(),
        *progress_args
    )

    archive_jobs = []
    for index, filename in enumerate(filenames):
        job = archive_queue.enqueue(
            archive,
            filename,
            media_id,
            user_id,
            result_ttl=3600*72,
            timeout=600
        )
        archive_jobs.append(job)

    task_status[0]["status"] = 'started'
    notification_queue.enqueue(
        send_progress,
        task_status.copy(),
        *progress_args
    )

    task_status[0]["status"] = 'completed'

    notification_queue.enqueue(
        send_progress,
        task_status.copy(),
        *progress_args,
        depends_on=archive_jobs[-1]
    )

    webasset_jobs = []
    for archive_job in archive_jobs:
        job = webasset_queue.enqueue(
            create_webassets,
            depends_on=archive_job,
            timeout=3600 * 5
        )
        webasset_jobs.append(job)

    task_status[1]['status'] = 'started'
    notification_queue.enqueue(
        send_progress,
        task_status.copy(),
        *progress_args
    )

    task_status[1]['status'] = 'completed'
    notification_queue.enqueue(
        send_progress,
        task_status.copy(),
        *progress_args,
        depends_on=webasset_jobs[-1]
    )

    return archive_jobs, webasset_jobs
