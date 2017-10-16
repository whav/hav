# Create your tasks here
from __future__ import absolute_import, unicode_literals
from celery import shared_task

from .operations.create import archive_file

@shared_task
def archive(filepath, media_id, user_id):
    return archive_file(filepath, media_id, user_id)

