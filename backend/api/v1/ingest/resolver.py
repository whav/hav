from urllib.parse import urlparse, unquote
import os

from django.urls import resolve

from django.conf import settings


def recurse(root):

    found = []
    for root, dirs, files in os.walk(root):
        for file in files:
            found.append(os.path.join(root, file))

    return found


def resolveIngestionUrl(url):

    path = urlparse(url).path
    match = resolve(path)

    if 'fs_browser' in match.namespaces:
        path = match.kwargs.get('path', '')

        file_or_path = os.path.join(
            settings.INCOMING_FILES_ROOT,
            path
        )

        file_or_path = unquote(file_or_path)

        if os.path.isfile(file_or_path):
            return [file_or_path]

        if os.path.isdir(file_or_path):
            return recurse(file_or_path)

        return []

    else:
        return []

