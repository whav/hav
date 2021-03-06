from django import template
from ..models import WebAsset
from ...archive.models import ArchiveFile

register = template.Library()

template_base = "webassets/tags"


@register.inclusion_tag(f"{template_base}/preview.html")
def webasset_preview(webasset: WebAsset):
    media_type = webasset.mime_type.split("/")[0]
    context = {
        "webasset": webasset,
        "preview_template": None,
        "poster": None,
    }
    if media_type == "image":
        context.update({"preview_template": f"{template_base}/image.html"})
    if media_type in ["audio", "video"]:
        context.update({"preview_template": f"{template_base}/video.html"})
    return context


@register.inclusion_tag(f"{template_base}/archive.html")
def archive_file_preview(archive_file: ArchiveFile):
    return {"archive_file": archive_file}
