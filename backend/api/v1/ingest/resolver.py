from urllib.parse import urlparse, unquote
import os
from pathlib import PurePath

from django.urls import resolve

from django.conf import settings


def recurse_folder(root):

    found = []
    for root, dirs, files in os.walk(root):
        for file in files:
            found.append(os.path.join(root, file))

    return found


def recurse_whav(collection):
    return []


def resolveIngestionUrl(url):

    path = urlparse(url).path
    match = resolve(path)

    files = []

    if 'fs_browser' in match.namespaces:
        path = match.kwargs.get('path', '')

        file_or_path = os.path.join(
            settings.INCOMING_FILES_ROOT,
            path
        )

        file_or_path = unquote(file_or_path)

        if os.path.isfile(file_or_path):
            files = [file_or_path]

        if os.path.isdir(file_or_path):
            files = recurse_folder(file_or_path)

    # whav
    # ['api', 'v1', 'whav_browser']
    # ResolverMatch(func=api.v1.whavBrowser.views.WHAVMediaDetail, args=(),
    #               kwargs={'collection_id': '6864', 'media_id': '115269'}, url_name=whav_media,
    #               app_names=['api', 'api', 'api'], namespaces=['api', 'v1', 'whav_browser']


    relfiles = [
        str(PurePath(f).relative_to(settings.INCOMING_FILES_ROOT)) for f in files
    ]

    relfiles.sort()

    return relfiles

