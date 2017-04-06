from . import *  #noqa

from . import secrets

DEBUG = False

STATIC_ROOT = '/home/hav/production/static/'
MEDIA_ROOT = '/home/hav/production/media/'
MEDIA_URL = '/media/'


ALLOWED_HOSTS = [
    'hav.univie.ac.at'
]

SECRET_KEY = secrets.SECRET_KEY