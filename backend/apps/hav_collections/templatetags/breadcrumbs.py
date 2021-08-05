from typing import Union
from django import template
from apps.media.models import Media

from apps.sets.models import Node

register = template.Library()


@register.inclusion_tag("ui/components/breadcrumbs.html", takes_context=True)
def render_breadcrumbs(context, obj: Union[Media, Node], include_last=False):
    if isinstance(obj, Media):
        node = obj.set
        collection = obj.collection
    elif isinstance(obj, Node):
        node = obj
        collection = node.get_collection()
    else:
        raise ValueError(f"Can not deal with {obj}")

    ancestors = list(node.get_ancestors().filter(depth__gte=collection.root_node.depth))
    if include_last:
        ancestors.append(node)
    return {"node": node, "collection": collection, "ancestors": ancestors}
