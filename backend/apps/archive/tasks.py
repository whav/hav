from __future__ import absolute_import, unicode_literals
from hav.celery import app
from api.v1.notifications import archive_finished
import logging
from .operations.create import archive_file


logger = logging.getLogger(__name__)

@app.task
def archive(filepath, media_id, user_id):
    logger.info(
        'Calling archive task with args: Filepath: %s, Media_id %d, user_id %d' % (
            filepath, media_id, user_id
        )
    )
    archive_id = archive_file(filepath, media_id, user_id)
    archive_finished(archive_id)
    return archive_id


