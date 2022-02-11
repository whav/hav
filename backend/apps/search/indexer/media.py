from apps.media.models import Media
import time
from typing import Union
from . import SearchIndexItem, ItemType
from apps.tags.utils import filter_location_tags
from apps.tags.templatetags.tagging import filter_tag


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
    _alltags = media.tags.all()
    tags = [tag.name for tag in list(filter(filter_tag, _alltags))]
    location_tags = [ltag.name for ltag in filter_location_tags(list(_alltags))]

    return SearchIndexItem(
        id=f"{type}_{media.pk}",
        type=type,
        pk=media.pk,
        title=media.title,
        additional_titles=[media.original_media_identifier, *list(filenames)]
        if media.original_media_identifier
        else [],
        tags=tags,
        location_tags=location_tags,
        body=media.description,
        last_update=time.time(),
        parents=parents,
        collection=media.collection.slug,
        node=media.set.pk,
    )
