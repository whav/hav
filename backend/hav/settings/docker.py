from .dev import *

import os

DATABASES['default'] = {
    'HOST': 'hav_db',
    'ENGINE': 'django.db.backends.postgresql',
    'PASSWORD': os.environ['HAV_PG_PW'],
    'USER': os.environ['HAV_PG_USER'],
    'NAME': os.environ['HAV_PG_DB']
}

DATABASES['whav'] = {
    'HOST': 'whav_db',
    'ENGINE': 'django.db.backends.postgresql',
    'PASSWORD': os.environ['WHAV_PG_PW'],
    'USER': os.environ['WHAV_PG_USER'],
    'NAME': os.environ['WHAV_PG_DB']
}

WEBPACK_LOADER['DEFAULT']['STATS_FILE'] = '/build/webpack-stats-development.json'

# USE_X_FORWARDED_HOST = True
# USE_X_FORWARDED_PORT = True

INCOMING_FILES_ROOT = '/incoming/'

CELERY_BROKER_URL = 'redis://redis:6379/1'
