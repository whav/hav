from collections import OrderedDict

import base64
import hmac
from django.conf import settings
from mimetypes import guess_type
from urllib.parse import urlencode, urlparse, urljoin

SECRET = settings.IMAGESERVER_CONFIG['secret']
URL_PREFIX = settings.IMAGESERVER_CONFIG['prefix']

def is_absolute(url):
    return bool(urlparse(url).netloc)


def is_image(filename):
    t, _ = guess_type(filename)
    if t is None:
        return False

    return t.split('/')[0] == 'image'


def generate_secret(secret, operation, kwargs):
    kwargs = OrderedDict(sorted(kwargs.items(), key=lambda t: t[0]))
    urlPath = '/{}'.format(operation)
    urlQuery = urlencode(kwargs)
    HMAC = hmac.new(
        secret.encode('utf-8'),
        msg='{}{}'.format(urlPath, urlQuery).encode('utf-8'),
        digestmod='sha256'
    )
    secret = base64.urlsafe_b64encode(HMAC.digest()).decode('utf-8')
    return secret.rstrip('=')

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

    # URL Signature is created as described here
    # https://github.com/h2non/imaginary#url-signature

    secret = generate_secret(SECRET, operation, kwargs)

    kwargs['sign'] = secret
    path = '{}?{}'.format(operation, urlencode(kwargs))
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
    return generate_url(path, width=None, height=None, type=None, operation='info')