import os
import uuid
import logging

from django.core.files import File
from apps.archive.models import ArchiveFile
from apps.media.models import Media

from .hash import generate_hash

logger = logging.getLogger('archive')


def _check_file_permissions(filepath):
    logger.debug('Checking file permissions for {0}'.format(filepath))
    assert os.path.exists(filepath), 'File does not exist.'
    assert os.path.isfile(filepath), 'Path is not a file.'
    assert os.access(filepath, os.R_OK), 'File is not readable by current user.'
    logger.debug('Basic file checks passed.')


def _get_file_size(filepath):
    statinfo = os.stat(filepath)
    return statinfo.st_size

def _get_archive_file_name(filepath, uuid):
    _, filename = os.path.split(filepath)
    _, ext = os.path.splitext(filename)
    return '{uuid}{ext}'.format(uuid=uuid, ext=ext)


def archive_file(filepath, media_id, user):
    media = Media.objects.get(pk=media_id)
    path = os.path.normpath(filepath)

    # do some basics checks
    _check_file_permissions(path)

    # generate uuid
    uid = uuid.uuid4()

    # some basic stats
    archive_fields = {
     'hash': generate_hash(path),
     'size':_get_file_size(path),
     'original_filename': os.path.split(path)[1],
     'archived_by': user,
     'id': uid,
    }

    filename = _get_archive_file_name(path, uid)
    af = ArchiveFile(**archive_fields)

    # check if everything looks good up to now
    af.full_clean(exclude=['file'])

    logger.info('Moving file to archive with name: {0}'.format(filename))

    with open(path, 'rb') as f:
        af.file.save(filename, File(f))

    af.save()

    af.media_set.add(media)

    return af



