from typing import Literal
import mimetypes
import os
import copy
from django.core.exceptions import ObjectDoesNotExist
from apps.archive.models import ArchiveFile
from apps.webassets.models import WebAsset

from .image import convert as image_convert
from .audio import convert as audio_convert, create_waveform
from .video import convert as video_convert, create_thumbnail
from .hints import get_hints_from_tags

import logging

logger = logging.getLogger(__name__)


def prepare_webasset(archive_file, extension):
    """Prepare a webasset instance for a specific file type"""
    wa = WebAsset(archivefile=archive_file)
    file_name = wa.get_available_file_name(extension)
    os.makedirs(os.path.dirname(file_name), exist_ok=True)
    wa.file = os.path.relpath(file_name, start=wa.file.storage.location)
    return wa


def resolve_converter(
    media_type: Literal["image", "video", "audio"], collection_slug: str = None
):
    if media_type == "image":
        return [image_convert]
    if media_type == "video":
        return [create_thumbnail, video_convert]
    if media_type == "audio":
        return [create_waveform, audio_convert]

    raise NotImplementedError(
        "Webasset creation not yet implemented for type {}".format(media_type)
    )


def create_webassets(archived_file_id: int):
    logger.info("Processing archive file %s" % archived_file_id)
    af = ArchiveFile.objects.prefetch_related("media_set__collection").get(
        pk=archived_file_id
    )

    try:
        collection_slug = af.media_set.get().collection.slug
    except ObjectDoesNotExist:
        logger.warning(
            f"""
            No collection found for archive file {archived_file_id}.
            This leads to collection specific converters to be ignored.
        """
        )
        collection_slug = None

    hints = {"collection": collection_slug}

    try:
        media = af.media_set.get()
    except ObjectDoesNotExist:
        logger.warning(
            f"""
            No media item found for archive file {archived_file_id}.
            We will be unable to generate hints from tags.
        """
        )
    else:
        hints.update(get_hints_from_tags(media.tags.all()))

    source_file_name = af.file.path
    source_mime = mimetypes.guess_type(source_file_name)[0]
    if source_mime is None:
        raise AssertionError(
            "Could not determine mime type of file {}".format(source_file_name)
        )

    media_type = source_mime.split("/")[0]

    if media_type not in ["image", "video", "audio"]:
        raise AssertionError(
            "Unable to process file {} of type {}.".format(
                source_file_name, source_mime
            )
        )

    converters = resolve_converter(media_type, collection_slug)
    logger.debug(f"Using the following converters: {converters}")

    # hints set on the archived file override hints from tags
    hints.update(af._webasset_hints or {})

    webassets = []
    for convert in converters:
        logger.info("Determined converter:  {}".format(convert.__name__))

        wa = prepare_webasset(af, convert.extension)

        target_file_name = wa.get_available_file_name(convert.extension)

        # create intermediate directories
        os.makedirs(os.path.dirname(target_file_name), exist_ok=True)

        logger.info("Source {}, target {}".format(source_file_name, target_file_name))

        convert(source_file_name, target_file_name, af, **hints)

        logger.info("Conversion completed.")
        wa.file = os.path.relpath(target_file_name, start=wa.file.storage.location)
        wa.mime_type = mimetypes.guess_type(target_file_name)[0]
        wa.save()
        logger.info("WebAsset {} successfully created.".format(wa.pk))
        webassets.append(wa)

    return webassets
