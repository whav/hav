from ...sets.models import Node
import time
from typing import Union
from . import SearchIndexItem, ItemType
from ...tags.utils import filter_location_tags
from ...tags.templatetags.tagging import filter_tag


def index(node: Union[Node, int]):
    if isinstance(node, int):
        node = Node.objects.get(pk=node)

    type = ItemType.folder
    ancestors = node.get_ancestors().values_list("pk", flat=True)
    collection = node.get_collection()
    _alltags = node.tags.all()
    tags = [tag.name for tag in list(filter(filter_tag, _alltags))]
    location_tags = [ltag.name for ltag in filter_location_tags(list(_alltags))]

    item = SearchIndexItem(
        id=f"{type}_{node.pk}",
        type=type,
        pk=node.pk,
        title=node.name,
        body=node.description,
        tags=tags,
        location_tags=location_tags,
        last_update=time.time(),
        parents=list(ancestors),
        collection=collection.slug,
    )
    return item
