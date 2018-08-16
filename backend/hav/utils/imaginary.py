from django.conf import settings
from urllib.parse import urlencode, urlparse, urljoin
from mimetypes import guess_type

import base64
import hashlib


SECRET = settings.IMAGESERVER_CONFIG['secret']
URL_PREFIX = settings.IMAGESERVER_CONFIG['prefix']

def is_absolute(url):
    return bool(urlparse(url).netloc)


def is_image(filename):
    t, _ = guess_type(filename)
    if t is None:
        return False

    return t.split('/')[0] == 'image'

def generate_url(path, operation='crop', **funckwargs):
    if not is_image(path):
        return None

    default_kwargs = {
        'width': 300,
        'height': 300,
        'type': 'auto'
    }

    default_kwargs.update(funckwargs)

    kwargs = {k: v for k, v in default_kwargs.items() if v is not None}

    if is_absolute(path):
        kwargs.update({
            'url': path
        })
    else:
        kwargs.update({
            'file': path
        })

    query = '{}?{}'.format(operation, urlencode(kwargs))
    md5_digest = hashlib.md5('{}:{}'.format(query, SECRET).encode('utf-8')).digest()
    key = base64.b64encode(md5_digest).decode('utf-8')
    # Make the key look like Nginx expects.
    key = key.replace('+', '-').replace('/', '_').rstrip('=')
    path = '{}/{}'.format(key, query)
    return urljoin(URL_PREFIX, path)


def generate_urls(file_path):
    results = []
    if not is_image(file_path):
        return results
    for kwargs in settings.IMAGE_RESOLUTIONS:
        results.append(
            (
                kwargs.get('width'),
                generate_url(file_path, operation='thumbnail', **kwargs)
            )
        )
    return results


def generate_info_url(path):
    print(path)
    return generate_url(path, width=None, height=None, type=None, operation='info')