import os
from . import *  #noqa

ALLOWED_HOSTS += [
    '*'
]

DEBUG = True

STATIC_URL = '/static/'

WEBPACK_LOADER['DEFAULT']['STATS_FILE'] = os.path.join(
    WEBPACK_BUILD_PATH,
    'webpack-stats-development.json'
)

WAGTAIL_SITE_NAME = 'HAV Development page'

MEDIA_ROOT = os.path.join(BASE_DIR, 'dist/media/')
MEDIA_URL = '/media/'