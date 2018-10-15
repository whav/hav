from __future__ import absolute_import, unicode_literals
from hav.celery import app
from api.v1.notifications import webassets_created
from .operations import create_webassets
from celery.utils.log import get_task_logger

logger = get_task_logger(__name__)

@app.task
def create(archived_file_id):
    webasset = create_webassets(archived_file_id, logger=logger)
    webassets_created(webasset.pk)
    return webasset.pk



