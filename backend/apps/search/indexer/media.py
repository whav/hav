from apps.media.models import Media
import time
from . import SearchIndexItem, ItemType


def index(media: Media):
    type = ItemType.media
    ancestors = media.set.get_ancestors().values_list('pk', flat=True)
    parents = [*list(ancestors), media.set.pk]
    return SearchIndexItem(
        id=f'{type}_{media.pk}',
        type=type,
        pk=media.pk,
        title=media.title,
        additional_titles=[media.original_media_identifier] if media.original_media_identifier else [],
        body=media.description,
        last_update=time.time(),
        parents=parents,
        collection=media.collection.slug,
        node=media.set.pk
    )
