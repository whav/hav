from channels.layers import get_channel_layer
from django_rq import get_queue
from asgiref.sync import async_to_sync

from apps.archive.tasks import archive
from apps.webassets.tasks import create_webassets_after_archive_task as create_webassets
from apps.ingest.models import IngestQueue
from rest_framework.exceptions import ValidationError

channel_layer = get_channel_layer()


def send_progress(msg, media_id, channel_group):
    async_to_sync(channel_layer.group_send)(
        channel_group, {"type": "ingest.progress", "msg": msg, "media_id": media_id}
    )


def send_initial_validation(source, channel_group, errors={}):
    async_to_sync(channel_layer.group_send)(
        channel_group, {"type": "ingest.progress", "msg": errors, "source_id": source}
    )


def archive_and_create_webassets(archive_files, media_id, channel_group):
    # TODO: untangle task updates from processing logic
    # TODO: error handling?
    # perhaps using a closure or similar
    progress_args = [media_id, channel_group]

    archive_queue = get_queue("archive")
    webasset_queue = get_queue("webassets")
    notification_queue = get_queue("default")

    task_status = [
        {"task": "archiving", "status": "pending"},
        {"task": "webassets", "status": "pending"},
    ]

    notification_queue.enqueue(send_progress, task_status.copy(), *progress_args)

    archive_jobs = []
    for archivefile_pk in archive_files:
        job = archive_queue.enqueue(
            archive,
            archivefile_pk,
            is_attachment=False,
            result_ttl=3600 * 72,
            job_timeout=600,
        )
        archive_jobs.append(job)

    # for filename in attachments:
    #     job = archive_queue.enqueue(
    #         archive,
    #         filename,
    #         media_id,
    #         user_id,
    #         is_attachment=True,
    #         result_ttl=3600*72,
    #         job_timeout=600
    #     )
    #     archive_jobs.append(job)

    task_status[0]["status"] = "started"
    notification_queue.enqueue(send_progress, task_status.copy(), *progress_args)

    task_status[0]["status"] = "completed"

    notification_queue.enqueue(
        send_progress, task_status.copy(), *progress_args, depends_on=archive_jobs[-1]
    )

    webasset_jobs = []
    for archive_job in archive_jobs:
        job = webasset_queue.enqueue(
            create_webassets, depends_on=archive_job, job_timeout=3600 * 5
        )
        webasset_jobs.append(job)

    task_status[1]["status"] = "started"
    notification_queue.enqueue(send_progress, task_status.copy(), *progress_args)

    task_status[1]["status"] = "completed"
    notification_queue.enqueue(
        send_progress, task_status.copy(), *progress_args, depends_on=webasset_jobs[-1]
    )

    return archive_jobs, webasset_jobs


def do_initial_queue_validation(queue_uuid):
    from .serializers import validate_initial_ingest

    iq = IngestQueue.objects.get(queue_uuid)
    sources = iq.ingestion_queue
    target = iq.target
    for source in sources:
        errors = {}
        try:
            validate_initial_ingest(source, target)
        except ValidationError as e:
            print(e)
        finally:
            send_initial_validation(source)
