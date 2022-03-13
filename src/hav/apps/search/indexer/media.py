import time
from typing import Union

from ...media.models import Media
from ...tags.templatetags.tagging import filter_tag
from ...tags.utils import filter_location_tags
from . import ItemType, SearchIndexItem


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
    creators = [c.name for c in media.creators.all()]
    creation_years = [
        y
        for y in range(
            media.creation_date.lower.year, media.creation_date.upper.year + 1
        )
    ]

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
        creators=creators,
        creation_years=creation_years,
        last_update=time.time(),
        parents=parents,
        collection=media.collection.slug,
        node=media.set.pk,
    )
