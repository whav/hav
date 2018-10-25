import pyvips
import logging

logger = logging.getLogger(__name__)


def convert(source, target, *args, **kwargs):
    logger.debug(f'Image convert called with source {source}, target {target}.')
    image = pyvips.Image.new_from_file(source)
    image.write_to_file(target)

convert.extension = '.jpg'

