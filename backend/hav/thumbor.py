from django.conf import settings
from libthumbor import CryptoURL

# defaults
unsafe = settings.DEBUG

secret_key = settings.THUMBOR_SECRET_KEY
server = settings.THUMBOR_SERVER

server = server.rstrip('/')

defaults = {
    'unsafe': unsafe,
    'smart': False,
    "height": 300,
    "fit_in": True
}

crypto = CryptoURL(secret_key)


def get_image_url(path, **kwargs):
    for k, v in defaults.items():
        kwargs.setdefault(k, v)

    url = crypto.generate(image_url=path, **kwargs)
    return '%s/%s' % (server, url)
