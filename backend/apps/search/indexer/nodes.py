from apps.sets.models import Node
import time
from . import SearchIndexItem, ItemType


def index(node: Node):
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
