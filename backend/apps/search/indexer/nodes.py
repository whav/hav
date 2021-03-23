from apps.sets.models import Node
import time
from typing import Union
from . import SearchIndexItem, ItemType


def index(node: Union[Node, int]):
    if isinstance(node, int):
        node = Node.objects.get(pk=node)

    type = ItemType.folder
    ancestors = node.get_ancestors().values_list("pk", flat=True)
    collection = node.get_collection()

    item = SearchIndexItem(
        id=f"{type}_{node.pk}",
        type=type,
        pk=node.pk,
        title=node.name,
        body=node.description,
        last_update=time.time(),
        parents=list(ancestors),
        collection=collection.slug,
    )
    return item
