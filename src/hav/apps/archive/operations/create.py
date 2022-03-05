import os
import logging

from django.core.files import File
from hav.apps.archive.models import ArchiveFile
from django.utils.timezone import now

from .hash import generate_hash

logger = logging.getLogger(__name__)


def _check_file_permissions(filepath):
    logger.debug("Checking file permissions for {0}".format(filepath))
    assert os.path.exists(filepath), "File does not exist."
    assert os.path.isfile(filepath), "Path is not a file."
    assert os.access(filepath, os.R_OK), "File is not readable by current user."
    logger.debug("Basic file checks passed.")


def _get_file_size(filepath):
    statinfo = os.stat(filepath)
    return statinfo.st_size


def _get_archive_file_name(filepath, uuid):
    _, filename = os.path.split(filepath)
    _, ext = os.path.splitext(filename)
    return "{uuid}{ext}".format(uuid=uuid, ext=ext)


def archive_file(af_pk, is_attachment=False):
    archive_file = ArchiveFile.objects.get(pk=af_pk)
    path = archive_file.resolve_source()

    # do some basics checks
    _check_file_permissions(path)

    # generate uuid

    # some basic stats
    archive_fields = {
        "hash": generate_hash(path),
        "size": _get_file_size(path),
        "original_filename": os.path.split(path)[1],
    }

    filename = _get_archive_file_name(path, archive_file.pk)

    archive_file.hash = generate_hash(path)
    archive_file.size = _get_file_size(path)
    archive_file.original_filename = os.path.split(path)[1]

    logger.info("Moving file to archive with name: {0}".format(filename))
    archive_file.archived_at = now()

    with open(path, "rb") as f:
        archive_file.file.save(filename, File(f))

    archive_file.save()
    return archive_file.pk
