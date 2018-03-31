from django.conf import settings
from urllib.parse import urlencode, urlparse

def is_absolute(url):
    return bool(urlparse(url).netloc)

def generate_imaginary_url(path):
    kwargs = {
        'width': 300,
        'height': 300
    }
    if is_absolute(path):
        kwargs.update({
            'url': path
        })
    else:
        kwargs.update({
            'file': path
        })
    return 'http://127.0.0.1:9000/crop?{0}'.format(
        urlencode(kwargs, safe='/')
    )
