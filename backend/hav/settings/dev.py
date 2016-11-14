import os
from . import *  #noqa

DEBUG = True

STATIC_URL = '/static/wp/'

WEBPACK_LOADER['DEFAULT']['STATS_FILE'] = os.path.join(
    WEBPACK_BUILD_PATH,
    'webpack-stats-development.json'
)

WAGTAIL_SITE_NAME = 'HAV Development page'

MEDIA_ROOT = os.path.join(BASE_DIR, 'dist/media/')
MEDIA_URL = '/media/'