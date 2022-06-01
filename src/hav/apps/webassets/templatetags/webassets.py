from functools import lru_cache
from mimetypes import guess_type
from typing import Union

from django import template
from django.conf import settings

from hav.apps.archive.models import ArchiveFile
from hav.apps.media.models import Media
from hav.apps.webassets.models import WebAsset
from hav.utils.imaginary import generate_srcset_urls, generate_thumbnail_url

from .gallery_tags import can_view_media_webassets

register = template.Library()

template_base = "webassets/tags"


@lru_cache(maxsize=1)
def _get_webassets_by_type(archive_file):
    webassets = archive_file.webasset_set.all()
    webassets_by_mime_type = {}

    for wa in webassets:
        wa_mime = wa.mime_type or guess_type(wa.file.name)[0]
        webassets_by_mime_type.setdefault(wa_mime, wa)
        webassets_by_mime_type.setdefault(wa_mime.split("/")[0], wa)

    return webassets_by_mime_type


def get_primary_webasset(archive_file):
    archive_type = archive_file.mime_type.split("/")[0]
    webassets_by_mime_type = _get_webassets_by_type(archive_file)
    return webassets_by_mime_type.get(archive_type)


def get_webasset_by_mime(archive_file, mime):
    wa_by_mime = _get_webassets_by_type(archive_file)
    return wa_by_mime.get(mime)


def get_media_plus_archivefile(obj: Union[WebAsset, ArchiveFile, Media]):
    if isinstance(obj, Media):
        media = obj
        archive_file = media.primary_file
    elif isinstance(obj, WebAsset):
        media = obj.archivefile.media_set.get()
        archive_file = obj.archivefile
    elif isinstance(obj, ArchiveFile):
        media = obj.media_set.get()
        archive_file = obj
    else:
        raise ValueError(f"Can not find webasset for object {obj}")
    return (media, archive_file)


@register.inclusion_tag(f"{template_base}/webasset.html", takes_context=True)
def render_webasset(context, obj: Union[WebAsset, ArchiveFile, Media], sizes=""):
    media, archive_file = get_media_plus_archivefile(obj)
    webasset = get_primary_webasset(archive_file)
    attachments = media.cached_attachments
    subtitletracks = media.cached_subtitle_tracks

    # TODO: access control
    user = context.get("user")
    can_view = can_view_media_webassets(user, media)

    if webasset is None and can_view:
        context = {"template": f"{template_base}/webassets/no_preview.html"}
    elif webasset and not can_view:
        context = {"template": f"{template_base}/webassets/forbidden.html"}
    elif webasset and can_view:
        media_type = None
        template = None
        mt = webasset.mime_type or guess_type(webasset.file.name)[0]
        if mt:
            media_type = mt.split("/")[0]
            template = f"{template_base}/webassets/{media_type}.html"

        # get the primary image for things such as posters
        secondary_webasset = get_webasset_by_mime(archive_file, "image")

        context = {
            "webasset": webasset,
            "image_webasset": secondary_webasset,
            "media": media,
            "media_type": media_type,
            "template": template,
            "sizes": sizes,
            "attachments": attachments,
        }

        if media_type == "image":
            context.update(
                {
                    "thumbnail_url": generate_thumbnail_url(webasset),
                    "srcset": generate_srcset_urls(
                        webasset, res_limit=media.resolution_limit
                    ),
                }
            )
        elif media_type == "video" or media_type == "audio":
            context.update(
                {
                    "subtitletracks": subtitletracks,
                }
            )

    return context


@register.inclusion_tag(f"{template_base}/variants.html", takes_context=True)
def variant_download_links(context, obj: Union[WebAsset, ArchiveFile, Media], sizes=""):
    media, archive_file = get_media_plus_archivefile(obj)
    webasset = get_primary_webasset(archive_file)
    if webasset:
        mt = webasset.mime_type or guess_type(webasset.file.name)[0]
        user = context.get("user")
        DLR = settings.DOWNLOAD_RESOLUTIONS
        if mt.split("/")[0] == "image" and can_view_media_webassets(user, media):
            srcset = generate_srcset_urls(webasset, res_limit=media.resolution_limit)
            context.update(
                {
                    "base_file_name": f"{media.original_media_identifier}",
                    "variants": (
                        {"variant_name": DLR[_s[0]], "width": _s[0], "url": _s[1]}
                        for _s in srcset
                        if _s[0] in DLR
                    ),
                }
            )
    return context


@register.inclusion_tag(f"{template_base}/preview.html")
def webasset_preview(webasset: WebAsset):
    archive_file = webasset.archivefile
    media = archive_file.media_set.get()

    context = {
        "webasset": webasset,
        "preview_template": None,
        "poster": None,
    }

    if media.is_public:

        media_type = webasset.mime_type.split("/")[0]

        if media_type == "image":
            context.update({"preview_template": f"{template_base}/image.html"})
        if media_type in ["audio", "video"]:
            # get the primary image for things such as posters
            secondary_webasset = get_webasset_by_mime(archive_file, "image")
            context.update(
                {
                    "preview_template": f"{template_base}/video.html",
                    "image_webasset": secondary_webasset,
                }
            )
    else:
        del context["webasset"]
        context.update({"preview_template": f"{template_base}/prohibited.html"})

    return context


@register.inclusion_tag(f"{template_base}/archive.html")
def archive_file_preview(archive_file: ArchiveFile):
    return {"archive_file": archive_file}
