from __future__ import absolute_import, unicode_literals
from hav.celery import app

from .operations.create import archive_file


@app.task
def archive(filepath, media_id, user_id):
    return archive_file(filepath, media_id, user_id)

