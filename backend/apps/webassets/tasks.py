from __future__ import absolute_import, unicode_literals
from hav.celery import app

from .operations import create_webassets


@app.task
def create(archived_file_id):
    webasset = create_webassets(archived_file_id)
    return webasset.pk



