
from django_rq import get_queue
from apps.archive.tasks import archive
from apps.webassets.tasks import create as create_webassets


def archive_and_create_webassets(filename, media_id, user_id):
    archive_queue = get_queue('archive')
    webasset_queue = get_queue('webassets')
    archive_job = archive_queue.enqueue(
        archive,
        filename,
        media_id,
        user_id
    )

    webasset_job = webasset_queue.enqueue(
        create_webassets,
        depends_on=archive_job
    )

    return archive_job, webasset_job