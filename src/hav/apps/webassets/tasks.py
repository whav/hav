from __future__ import absolute_import, unicode_literals

import logging

from django.conf import settings
from django_rq import get_queue, job
from rq import get_current_job

from .operations import create_webassets

logger = logging.getLogger(__name__)


@job("webassets", timeout=settings.WEBASSET_CREATION_TIMEOUT)
def create(archived_file_id):
    webassets = create_webassets(archived_file_id)
    return [wa.pk for wa in webassets]


@job("webassets", timeout=settings.WEBASSET_CREATION_TIMEOUT)
def create_webassets_after_archive_task():
    current_job = get_current_job()
    previous_job_id = current_job.dependency.id
    archive_queue = get_queue("archive")
    archived_file_id = archive_queue.fetch_job(previous_job_id).result
    webassets = create_webassets(archived_file_id)
    return [wa.pk for wa in webassets]


# @job('webassets')
# def debug_logging():
#     print('-' * 50)
#     print('I am being printed.')
#     logger.warning('I am a warning.')
#     logger.info('I am an info message.')
#     logger.error('I am an error.')
