from tempfile import NamedTemporaryFile
import pyvips
import logging
import mimetypes
import imageio
import rawpy

logger = logging.getLogger(__name__)


def magickload(source):
    return pyvips.Image.magickload(source)


def extract_thumbnail(source):
    with rawpy.imread(source) as raw:
        # raises rawpy.LibRawNoThumbnailError if thumbnail missing
        # raises rawpy.LibRawUnsupportedThumbnailError if unsupported format
        thumb = raw.extract_thumb()

    return pyvips.Image.new_from_buffer(thumb.data, "")


def raw_loader(source):
    with rawpy.imread(source) as raw:
        rgb = raw.postprocess(
            output_bps=16, no_auto_scale=True, no_auto_bright=True, gamma=(1, 1)
        )
    return pyvips.Image.new_from_buffer(rgb, "")


def default_loader(source):
    return pyvips.Image.new_from_file(source)


collection_loaders = {
    "nebesky": {
        "image/x-nikon-nef": magickload,
    },
    "ritual-space-mimesis": {"image/x-adobe-dng": extract_thumbnail},
    # for reference: something like this should also work
    # it will use the specified loader for all mime-types
    # that are not defined via collection and mime-type
    # "image/x-adobe-dng": raw_loader
}


def convert(source, target, *args, **hints):

    format = mimetypes.guess_type(source)[0]

    logger.debug(
        f"Image convert called with source {source} (mime: {format}), target {target}."
    )

    rotation = hints.get("rotation", None)
    collection = hints.get("collection", None)

    try:
        loader = collection_loaders[collection][format]
    except KeyError:
        # try again with just the format as a hint
        # and the default loader as a fallback
        loader = collection_loaders.get(format, default_loader)

    logger.debug(f"Determined image loader: {loader}")
    image = loader(source)

    # apply hints
    if rotation:
        image = image.rotate(rotation)
    else:
        image = image.autorot()
    # write to target
    image.write_to_file(target)


convert.extension = ".jpg"
