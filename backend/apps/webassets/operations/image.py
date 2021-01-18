from tempfile import NamedTemporaryFile
import pyvips
import logging
import mimetypes
import imageio
import rawpy

logger = logging.getLogger(__name__)

raw_formats = set([
    "image/x-nikon-nef",
    "image/x-adobe-dng"
])


def convert(source, target, *args, **kwargs):
    logger.debug(f"Image convert called with source {source} ({mimetypes.guess_type(source)[0]}), target {target}.")

    tmp_file = None

    try:
        if mimetypes.guess_type(source)[0] in raw_formats:
            with rawpy.imread(source) as raw:
                rgb = raw.postprocess()

            tmp_file = NamedTemporaryFile(suffix='tiff')
            imageio.imsave(tmp_file, rgb, format='tiff')
            tmp_file.seek(0)
            logger.debug(f"Image convert created temp file at {tmp_file.name}.")
            source = tmp_file.name

        # actually do the conversion
        image = pyvips.Image.new_from_file(source)
        image.write_to_file(target)
    finally:
        if tmp_file:
            tmp_file.close()


convert.extension = ".jpg"
