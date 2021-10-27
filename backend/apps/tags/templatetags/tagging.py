from typing import List
from ..models import Tag
from django import template

register = template.Library()


prefixes = [
    # geo
    "country:",
    "province/state",
    "city:",
    "municipality:",
    # ordering
    "ordering:",
    "resolution_limit:",
]


def filter_tag(tag: Tag):
    for p in prefixes:
        if tag.name.startswith(p):
            return False
    return True


@register.inclusion_tag("ui/components/tags/list.html")
def render_tags(tags: List[Tag]):
    return {"tags": filter(filter_tag, tags)}
