from apps.media.models import Media
import time
from typing import Union
from . import SearchIndexItem, ItemType


def index(media: Union[Media, int]):
    if isinstance(media, int):
        media = Media.objects.get(pk=media)
    type = ItemType.media
    ancestors = media.set.get_ancestors().values_list("pk", flat=True)
    parents = [*list(ancestors), media.set.pk]
    archivefiles = media.files.all()
    filenames = set()
    for file in archivefiles:
        filenames.add(file.original_filename)

    return SearchIndexItem(
        id=f"{type}_{media.pk}",
        type=type,
        pk=media.pk,
        title=media.title,
        additional_titles=[media.original_media_identifier, *list(filenames)]
        if media.original_media_identifier
        else [],
        body=media.description,
        last_update=time.time(),
        parents=parents,
        collection=media.collection.slug,
        node=media.set.pk,
    )
