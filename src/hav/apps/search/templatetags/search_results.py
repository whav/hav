from django import template
from functools import lru_cache
from typing import Union
from hav.apps.sets.models import Node
from hav.apps.media.models import Media
from django.urls import reverse

register = template.Library()


@register.inclusion_tag("search/tags/search_result.html")
def render_search_result(result):
    object = result["object"]
    matches = result["_matchesInfo"]
    formatted = result["_formatted"]
    output = {}
    for match_field in matches.keys():
        output[match_field] = formatted[match_field]

    output = output.values()
    return {
        "result": result,
        "lines": output,
        "found_in_fields": list(matches.keys()),
        "formatted": result.get("_formatted"),
        "object": object,
    }


@register.filter
@lru_cache(1)
def target_url(obj: Union[Node, Media]):
    if isinstance(obj, Media):
        collection = obj.collection
        return reverse(
            "hav:media_view",
            kwargs={"collection_slug": collection.slug, "media_pk": obj.pk},
        )

    if isinstance(obj, Node):
        collection = obj.get_collection()
        return reverse(
            "hav:folder_view",
            kwargs={"collection_slug": collection.slug, "node_pk": obj.pk},
        )

    raise NotImplementedError(f"Can not deal with object {obj}")
