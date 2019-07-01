from __future__ import absolute_import, unicode_literals
import logging
from .operations.create import archive_file
from django_rq import job

logger = logging.getLogger(__name__)

@job('archive')
def archive(filepath, media_id, user_id, is_attachment=False, **kwargs):
    logger.info(
        f'Calling archive task with args: Filepath: {filepath}, Media_id {media_id}, user_id {user_id}, attachment: {is_attachment}')
    return archive_file(filepath, media_id, user_id, is_attachment=is_attachment, **kwargs)


