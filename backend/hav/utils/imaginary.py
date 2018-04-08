from django.conf import settings
from urllib.parse import urlencode, urlparse

import base64
import hashlib


SECRET = settings.IMAGESERVER_CONFIG['secret']

def is_absolute(url):
    return bool(urlparse(url).netloc)

def generate_imaginary_url(path, operation='crop', **funckwargs):
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

    query = '{}?{}'.format(operation, urlencode(kwargs, safe='/'))
    md5_digest = hashlib.md5('{}:{}'.format(query, SECRET).encode('utf-8')).digest()
    key = base64.b64encode(md5_digest).decode('utf-8')
    # Make the key look like Nginx expects.
    key = key.replace('+', '-').replace('/', '_').rstrip('=')
    return 'http://127.0.0.1:9000/{}/{}'.format(key, query)
