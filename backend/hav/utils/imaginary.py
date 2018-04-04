from django.conf import settings
from urllib.parse import urlencode, urlparse

import base64
import hashlib


SECRET = 'TOPSECRET'

def is_absolute(url):
    return bool(urlparse(url).netloc)

def generate_imaginary_url(path):
    kwargs = {
        'width': 300,
        'height': 300,
        'type': 'auto'
    }
    if is_absolute(path):
        kwargs.update({
            'url': path
        })
    else:
        kwargs.update({
            'file': path
        })

    query = 'crop?{}'.format(urlencode(kwargs, safe='/'))
    md5_digest = hashlib.md5('{}:{}'.format(query, SECRET).encode('utf-8')).digest()
    key = base64.b64encode(md5_digest).decode('utf-8')
    # Make the key look like Nginx expects.
    key = key.replace('+', '-').replace('/', '_').rstrip('=')
    return 'http://127.0.0.1:9000/{}/{}'.format(key, query)
