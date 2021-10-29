from typing import List
from ..models import Tag
from django import template
from django.template.defaultfilters import stringfilter
from django.utils.safestring import mark_safe
import re

register = template.Library()

prefixes = [
    "area",  # geo
    # "branch",
    # "building",
    "city",  # geo
    "country",  # geo
    # "deity",
    "description_author",
    # "direction",
    # "dwelling",
    # "event",
    # "event-step",
    # "event-time",
    # "festival",
    # "group",
    # "implement",
    # "informant",
    # "item",
    "location",
    "location_detail",
    # "material",
    # "material-culture",
    "media_shorthandle",
    "municipality",
    # "mythology",
    "node_media",
    # "note",
    # "object-type",
    "ordering",
    # "organizer",
    # "part",
    # "participant",
    # "performer",
    # "picture-content",
    # "place",
    # "process",
    # "process-step",
    # "product",
    "province/state",
    # "purpose",
    # "receiver",
    # "religion",
    # "religious-implement",
    # "researcher",
    "resolution_limit",
    # "ritual",
    # "ritual-type",
    # "role",
    "rotate",
    # "season",
    # "shown in image",
    # "song",
    # "space",
    # "sub-branch",
    # "sub–branch",
    # "work-sphere",
]

# append ":" to each "special" tag
prefixes = [re.escape(f"{p}:") for p in prefixes]
prefixes_re = "|".join(prefixes)

prefix_pattern = re.compile(f"^{prefixes_re}")


def filter_tag(tag: Tag):
    if re.match(prefix_pattern, tag.name):
        return False
    return True


@register.inclusion_tag("ui/components/tags/list.html")
def render_tags(tags: List[Tag]):
    return {"tags": filter(filter_tag, tags)}


geo_pattern = re.compile("(GEON|TGN):(\d+)")


@register.filter
@stringfilter
def geotag(tag: str):

    matches = re.findall(geo_pattern, tag)

    if len(matches):
        for provider, id in matches:
            if provider == "GEON":
                title = "geonames.org"
                url = f"https://www.geonames.org/{id}/"
            else:
                title = "tgn"
                url = f"http://vocab.getty.edu/page/tgn/{id}"

            tag = tag.replace(
                ":".join([provider, id]), f'<a href="{url}">{title}</a>', 1
            )

        return mark_safe(tag)

    return tag
