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
