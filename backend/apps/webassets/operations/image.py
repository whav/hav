import os
import shutil
import requests
from requests.exceptions import RequestException
from apps.webassets.imaginary import generate_url
import logging

logger = logging.getLogger(__name__)

HOSTS = [
    'http://imaginary:9000',    # inside docker-compose network
    'http://127.0.0.1:8000',    # local development
    'http://127.0.0.1:9000',    # local development
]

class ImageConversionError(BaseException):
    pass


def fetch_image(url):
    logger.info('Grabbing image from %s.' % url)
    response = requests.get(url, stream=True)
    response.raise_for_status()
    return response

def convert(source, target, archivefile):
    logger.debug(f'Image convert called with source {source}, target {target} and archivefile {archivefile}')
    # since the source argument is absolute
    # grab the relative path from the database
    # object directly
    relative_file_name = archivefile.file.name
    url_path = generate_url(
        os.path.join('archive/', relative_file_name),
        operation='convert',
        width=None,
        height=None,
        type='jpeg'
    )
    logger.info(f'Determined url_path {url_path}')

    # FIXME: this is a hack
    # Reasoning: we try to be flexible with the environment we run in
    possible_urls = map(lambda host: f'{host}{url_path}', HOSTS)
    possible_urls = [url_path] + list(possible_urls)

    logger.debug('Will try the following urls:', possible_urls)
    for url in possible_urls:
        try:
            response = fetch_image(url)
        except RequestException:
            logger.exception(f'Unable to retrieve {url}.')
            continue
        else:
            break
    else:
        logger.error(f'Unable to request image conversion from {possible_urls}')
        raise ImageConversionError('Unable to request image conversion.')


    with open(target, 'wb') as out_file:
        shutil.copyfileobj(response.raw, out_file)
    del response


convert.extension = '.jpg'

