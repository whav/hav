from __future__ import absolute_import, unicode_literals
import logging
from .operations.create import archive_file
from django_rq import job

logger = logging.getLogger(__name__)

@job('archive')
def archive(filepath, media_id, user_id):
    logger.info(
        'Calling archive task with args: Filepath: %s, Media_id %d, user_id %d' % (
            filepath, media_id, user_id
        )
    )
    return archive_file(filepath, media_id, user_id)



