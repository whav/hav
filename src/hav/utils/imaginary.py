from collections import OrderedDict
from pathlib import Path

import base64
import hmac
from django.conf import settings
from mimetypes import guess_type
from urllib.parse import urlencode, urlparse, urljoin

from django.templatetags.static import static

fallback_url = static("webassets/no_image_available.svg")
fallback_url_is_private = static("webassets/no_public_media_available.svg")

SECRET = settings.IMAGESERVER_CONFIG["secret"]
URL_PREFIX = settings.IMAGESERVER_CONFIG["prefix"]
INCOMING_ROOT = Path(settings.INCOMING_FILES_ROOT)

ALLOWED_MIME_TYPES = [
    "application/pdf",
]

mime_types = set(ALLOWED_MIME_TYPES)


def is_absolute(url):
    return bool(urlparse(url).netloc)


def is_image(filename):
    t, _ = guess_type(filename)

    if t is None:
        return False

    if t in mime_types:
        return True

    return t.split("/")[0] == "image"


def protected_src(media, user, path):
    raise NotImplementedError("This should not be used anymore")
    if media.is_public:
        return path

    return fallback_url_is_private


def get_imaginary_path(obj_or_path, user=None):
    # TODO: this is ugly. But it should be the only place to deal with mapping
    # database stored file paths to imaginary mounted volumes and such

    # import here to avoid circular imports
    from hav.apps.webassets.models import WebAsset
    from hav.apps.archive.models import ArchiveFile
    from hav.apps.sources.uploads.models import FileUpload

    if isinstance(obj_or_path, WebAsset):
        path = Path("webassets/").joinpath(obj_or_path.file.name).as_posix()
        return path
    elif isinstance(obj_or_path, ArchiveFile):
        path = Path("archive/").joinpath(obj_or_path.file.name).as_posix()
        return path
    elif isinstance(obj_or_path, str) and is_absolute(obj_or_path):
        # url case
        return obj_or_path
    elif isinstance(obj_or_path, FileUpload):
        return Path("uploads/").joinpath(obj_or_path.file.name).as_posix()
    elif isinstance(obj_or_path, (str, Path)):
        path = Path(obj_or_path)
        if path.is_absolute():
            path = path.relative_to(INCOMING_ROOT)
        return Path("incoming/").joinpath(path).as_posix()
    else:
        raise NotImplementedError(f"Can not deal with {obj_or_path}")


def generate_secret(secret, operation, kwargs):
    # URL Signature is created as described here
    # https://github.com/h2non/imaginary#url-signature
    kwargs = OrderedDict(sorted(kwargs.items(), key=lambda t: t[0]))
    urlPath = "/{}".format(operation)
    urlQuery = urlencode(kwargs)
    HMAC = hmac.new(
        secret.encode("utf-8"),
        msg="{}{}".format(urlPath, urlQuery).encode("utf-8"),
        digestmod="sha256",
    )
    secret = base64.urlsafe_b64encode(HMAC.digest()).decode("utf-8")
    return secret.rstrip("=")


def generate_imaginary_url(path, operation="crop", **kwargs):
    default_kwargs = {
        "width": 300,
        "height": 300,
        "type": "jpeg",
        "background": "255,255,255",
    }
    default_kwargs.update(kwargs)
    kwargs = {k: v for k, v in default_kwargs.items() if v is not None}

    if is_absolute(path):
        kwargs.update({"url": path})
    else:
        kwargs.update({"file": path})

    secret = generate_secret(SECRET, operation, kwargs)

    kwargs["sign"] = secret
    path = "{}?{}".format(operation, urlencode(kwargs))
    return urljoin(URL_PREFIX, path)


def generate_thumbnail_url(obj, **kwargs):
    path = get_imaginary_path(obj)
    thumbnail_kwargs = {
        "width": 300,
        "height": 300,
        "type": "jpeg",
        "operation": "crop",
    }
    thumbnail_kwargs.update(kwargs)
    return generate_imaginary_url(path, **thumbnail_kwargs)


def generate_srcset_urls(file_path, res_limit=None):
    path = get_imaginary_path(file_path)
    results = []
    if not is_image(path):
        return results

    # Don't provide srcset_urls for resolutions beyond res_limit (needed to
    # honor maxRes since Imaginary is upscaling beyond src-resolution)
    if res_limit:
        resolutions = [
            res for res in settings.IMAGE_RESOLUTIONS if res["width"] <= res_limit
        ]
    else:
        resolutions = settings.IMAGE_RESOLUTIONS

    for kwargs in resolutions:
        results.append(
            (
                kwargs.get("width"),
                generate_imaginary_url(path, operation="thumbnail", **kwargs),
            )
        )
    return results


def generate_src_url(file_path):

    path = get_imaginary_path(file_path)
    if not is_image(path):
        return ""
    return generate_imaginary_url(path, operation="thumbnail", width=1024, height=None)


def generate_info_url(obj):
    path = get_imaginary_path(obj)
    return generate_thumbnail_url(
        path, width=None, height=None, type=None, operation="info"
    )
