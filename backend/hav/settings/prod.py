from . import *  #noqa

from . import secrets

DEBUG = False

ALLOWED_HOSTS = [
    'hav.univie.ac.at'
]

SECRET_KEY = secrets.SECRET_KEY