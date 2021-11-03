from typing import Union
from django import template
from mimetypes import guess_type
from apps.webassets.models import WebAsset
from apps.archive.models import ArchiveFile
from apps.media.models import Media
from hav_utils.imaginary import (
    generate_thumbnail_url,
    generate_srcset_urls,
)

from .gallery_tags import can_view_media_webassets

register = template.Library()

template_base = "webassets/tags"


def get_primary_webasset(archive_file):
    archive_type = archive_file.mime_type.split("/")[0]
    webassets = archive_file.webasset_set.all()
    webassets_by_mime_type = {}

    for wa in webassets:
        wa_mime = wa.mime_type or guess_type(wa.file)[0]
        webassets_by_mime_type.setdefault(wa_mime.split("/")[0], wa)

    return webassets_by_mime_type.get(archive_type, webassets[0])


@register.inclusion_tag(f"{template_base}/webasset.html", takes_context=True)
def render_webasset(context, obj: Union[WebAsset, ArchiveFile, Media]):
    if isinstance(obj, Media):
        media = obj
        archive_file = media.primary_file
        webassets = archive_file.webasset_set.all()
    elif isinstance(obj, WebAsset):
        media = obj.archivefile.media_set.get()
        archive_file = obj.archivefile
        webassets = [obj]
    elif isinstance(obj, ArchiveFile):
        media = obj.media_set.get()
        archive_file = obj
        webassets = obj.webasset_set.all()
    else:
        raise ValueError(f"Can not find webasset for object {obj}")

    # breakpoint()

    # TODO: figure out a better way to retrieve the correct webasset
    webasset = webassets[0]
    webasset = get_primary_webasset(archive_file)

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
        mt = webasset.mime_type or guess_type(webasset.file)[0]
        if mt:
            media_type = mt.split("/")[0]
            template = f"{template_base}/webassets/{media_type}.html"

        context = {
            "webasset": webasset,
            "media": media,
            "media_type": media_type,
            "template": template,
        }

        if media_type == "image":
            context.update(
                {
                    "thumbnail_url": generate_thumbnail_url(webasset),
                    "srcset": generate_srcset_urls(webasset),
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
            context.update({"preview_template": f"{template_base}/video.html"})
    else:
        del context["webasset"]
        context.update({"preview_template": f"{template_base}/prohibited.html"})

    return context


@register.inclusion_tag(f"{template_base}/archive.html")
def archive_file_preview(archive_file: ArchiveFile):
    return {"archive_file": archive_file}
