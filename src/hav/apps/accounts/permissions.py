from functools import lru_cache

from hav.apps.hav_collections.models import Collection
from hav.apps.media.models import Media
from hav.apps.webassets.models import WebAsset

from .models import User


@lru_cache(maxsize=1, typed=True)
def can_view_webassets(user: User, webasset: WebAsset):
    if user.is_superuser:
        return True

    media = webasset.archivefile.media
    return can_view_media(user, media)


@lru_cache(maxsize=1, typed=True)
def is_collection_admin(user: User, collection: Collection):

    if user.is_authenticated:
        return user in collection.administrators.all()

    return False


def can_view_media(user: User, media: Media):
    if user.is_superuser:
        return True

    has_active_embargo = media.currently_under_embargo
    is_private = media.is_private

    if is_private or has_active_embargo:
        return is_collection_admin(user, media.collection)

    return True
