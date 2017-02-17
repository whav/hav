from libthumbor import CryptoURL

# defaults
UNSAFE = False

try:
    from hav.settings.secrets import THUMBOR_SECRET_KEY
except ImportError:
    THUMBOR_SECRET_KEY = 'my-secret-key'
    UNSAFE = True


try:
    from hav.settings.secrets import THUMBOR_SERVER
except:
    THUMBOR_SERVER = 'http://127.0.0.1:8888'

THUMBOR_SERVER = THUMBOR_SERVER.strip('/')

defaults = {
    'unsafe': UNSAFE,
    'smart': False,
    "height": 200,
    "fit_in": True
}

crypto = CryptoURL(THUMBOR_SECRET_KEY)


def get_image_url(path, **kwargs):
    for k, v in defaults.items():
        kwargs.setdefault(k, v)

    url = crypto.generate(image_url=path, **kwargs)
    return '%s/%s' % (THUMBOR_SERVER, url)
