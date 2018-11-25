from __future__ import absolute_import, unicode_literals
import logging
from django_rq import job, get_queue
from rq import get_current_job

from .operations import create_webassets


logger = logging.getLogger(__name__)


@job('webassets')
def create(archived_file_id=None):
    if archived_file_id is None:
        current_job = get_current_job()
        previous_job_id = current_job.dependency.id
        archive_queue = get_queue('archive')
        archived_file_id = archive_queue.fetch_job(previous_job_id).result
    webasset = create_webassets(archived_file_id)
    return webasset.pk

@job('webassets')
def debug():
    print('-' * 50)
    print('I am being printed.')
    logger.warning('I am a warning.')
    logger.info('I am an info message.')
    logger.error('I am an error.')


