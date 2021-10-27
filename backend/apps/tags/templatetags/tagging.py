from typing import List
from ..models import Tag
from django import template
import re

register = template.Library()


prefixes = [
    "area",
    "branch",
    "building",
    "city",
    "country",
    "deity",
    "description_author",
    "direction",
    "dwelling",
    "event",
    "event-step",
    "event-time",
    "festival",
    "group",
    "implement",
    "informant",
    "item",
    "location",
    "location_detail",
    "material",
    "material-culture",
    "media_shorthandle",
    "municipality",
    "mythology",
    "node_media",
    "note",
    "object-type",
    "ordering",
    "organizer",
    "part",
    "participant",
    "performer",
    "picture-content",
    "place",
    "process",
    "process-step",
    "product",
    "province/state",
    "purpose",
    "receiver",
    "religion",
    "religious-implement",
    "researcher",
    "resolution_limit",
    "ritual",
    "ritual-type",
    "role",
    "rotate",
    "season",
    "shown in image",
    "song",
    "space",
    "sub-branch",
    "sub–branch",
    "work-sphere",
]

# append ":" to each "special" tag
prefixes = [f"{p}:" for p in prefixes]
prefixes_re = "|".join(prefixes)

prefix_pattern = re.compile(f"^{prefixes_re}")


def filter_tag(tag: Tag):
    if re.match(prefix_pattern, tag.name):
        return False
    return True


@register.inclusion_tag("ui/components/tags/list.html")
def render_tags(tags: List[Tag]):
    return {"tags": filter(filter_tag, tags)}
