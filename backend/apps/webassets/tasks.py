from __future__ import absolute_import, unicode_literals
import logging
from hav.celery import app

from .operations import create_webassets


logger = logging.getLogger(__name__)

@app.task
def create(archived_file_id):
    webasset = create_webassets(archived_file_id)
    return webasset.pk

@app.task
def debug():
    print('-' * 50)
    print('I am being printed.')
    logger.warning('I am a warning.')
    logger.info('I am an info message.')
    logger.error('I am an error.')


