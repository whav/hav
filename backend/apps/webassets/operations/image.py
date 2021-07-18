from tempfile import NamedTemporaryFile
import pyvips
import logging
import mimetypes
import imageio
import rawpy


logger = logging.getLogger(__name__)


def magickload(source, pipeline):
    img = pyvips.Image.magickload(source)
    return pipeline(img)


def extract_thumbnail(source, pipeline):
    with rawpy.imread(source) as raw:
        # raises rawpy.LibRawNoThumbnailError if thumbnail missing
        # raises rawpy.LibRawUnsupportedThumbnailError if unsupported format
        thumb = raw.extract_thumb()

    img = pyvips.Image.new_from_buffer(thumb.data, "")
    return pipeline(img)


def raw_loader(source, pipeline):
    with NamedTemporaryFile(suffix=".tiff") as output:
        with rawpy.imread(source) as raw:
            rgb = raw.postprocess(
                use_camera_wb=True,
            )

            imageio.imsave(output.name, rgb)
            img = pyvips.Image.new_from_file(output.name)

            return pipeline(img)


def default_loader(source, pipeline):
    img = pyvips.Image.new_from_file(source)
    return pipeline(img)


collection_loaders = {
    "nebesky": {
        "image/x-nikon-nef": extract_thumbnail,
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
    max_resolution = hints.get("max_resolution", None)
    collection = hints.get("collection", None)

    try:
        # try to get a collection specific loader for this mime type
        loader = collection_loaders[collection][format]
    except KeyError:
        # try again with just the format as a hint
        # and the default loader as a fallback
        loader = collection_loaders.get(format, default_loader)

    logger.debug(f"Determined image loader: {loader}")

    def vips_pipeline(image):
        # apply hints
        if rotation:
            image = image.rotate(rotation)
        else:
            image = image.autorot()

        if max_resolution:
            max_side = max(image.width, image.height)
            if max_side > max_resolution:
                factor = max_resolution / max_side
                image = image.resize(factor)

        # write to target
        image.write_to_file(target)

    loader(source, vips_pipeline)


convert.extension = ".jpg"
