import os
from . import *  #noqa

DEBUG = True

STATIC_URL = '/static/wp/'

WEBPACK_LOADER['DEFAULT']['STATS_FILE'] = os.path.join(
    WEBPACK_BUILD_PATH,
    'webpack-stats-development.json'
)
