import mimetypes
import os

from apps.archive.models import ArchiveFile
from ..models import WebAsset

from .image import convert as image_convert
from .audio import convert as audio_convert, create_waveform
from .video import convert as video_convert, create_thumbnail


import logging

logger = logging.getLogger(__name__)


def prepare_webasset(archive_file, extension):
    """Prepare a webasset instance for a specific file type


    """
    wa = WebAsset(archivefile=archive_file)
    file_name = wa.get_available_file_name(extension)
    os.makedirs(os.path.dirname(file_name), exist_ok=True)
    wa.file = os.path.relpath(file_name, start=wa.file.storage.location)
    return wa


def create_audio_thumbnail(af):
    wa = prepare_webasset(af, 'png')
    create_waveform(af.file.path, wa.file.path)
    wa.save()
    logger.info('Audio waveform webasset {} successfully generated.'.format(wa.pk))

def create_video_thumbnail(af):
    wa = prepare_webasset(af, 'jpg')
    create_thumbnail(af.file.path, wa.file.path)
    wa.save()
    logger.info('Video thumbnail webasset {} successfully created.'.format(wa.pk))


def create_webassets(archived_file_id):
    logger.info('Processing archive file %s' % archived_file_id)
    af = ArchiveFile.objects.get(pk=archived_file_id)
    source_file_name = af.file.path
    source_mime = mimetypes.guess_type(source_file_name)[0]
    if source_mime is None:
        raise AssertionError('Could not determine mime type of file {}'.format(source_file_name))

    type = source_mime.split('/')[0]

    if type not in ['image', 'video', 'audio']:
        raise AssertionError('Unable to process file {} of type {}.'.format(source_file_name, source_mime))

    if type == 'image':
        convert = image_convert
    elif type == 'video':
        convert = video_convert
        # create a video thumbnail before processing
        create_video_thumbnail(af)
    elif type == 'audio':
        convert = audio_convert
        create_audio_thumbnail(af)
    else:
        raise NotImplementedError('Webasset creation not yet implemented for type {}'.format(source_mime))

    logger.info('Determined converter:  {}'.format(convert.__name__))

    wa = prepare_webasset(af, convert.extension)

    target_file_name = wa.get_available_file_name(convert.extension)

    # create intermediate directories
    os.makedirs(os.path.dirname(target_file_name), exist_ok=True)

    logger.info("Source {}, target {}".format(source_file_name, target_file_name))

    convert(source_file_name, target_file_name, af)

    logger.info('Conversion completed.')
    wa.file = os.path.relpath(target_file_name, start=wa.file.storage.location)
    wa.mime_type = mimetypes.guess_type(target_file_name)[0]
    wa.save()
    logger.info('WebAsset {} successfully created.'.format(wa.pk))
    return wa

