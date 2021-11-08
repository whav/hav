from django import template

from ..models import ArchiveFile

register = template.Library()


@register.simple_tag(takes_context=True)
def archive_download_permission(context, archive_file: ArchiveFile):
    user = context.get("user")
    return archive_file.has_download_permission(user)
