from typing import Union
from django import template
from apps.media.models import Media
from apps.sets.models import Node
from apps.hav_collections.models import Collection

register = template.Library()


@register.simple_tag
def frontend_url(obj: Union[Media, Node, Collection]):
    if isinstance(obj, Media):
        collection = obj.collection
        return f"/collections/{collection.slug}/media/{obj.pk}/"
    elif isinstance(obj, Node):
        collection = obj.get_collection()
        return f"/collections/{collection.slug}/browse/{object.pk}/"
    elif isinstance(obj, Collection):
        return f"/collections/{obj.slug}/"
    else:
        raise NotImplementedError(f"Can not deal with object {obj}")
