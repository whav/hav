from __future__ import absolute_import, unicode_literals
import logging
from .operations.create import archive_file
from django_rq import job

logger = logging.getLogger(__name__)

@job('archive')
def archive(pk, is_attachment=False, **kwargs):
    logger.info(
        f'Calling archive task for ArchiveFile {pk}.')
    return archive_file(pk, is_attachment=is_attachment, **kwargs)


