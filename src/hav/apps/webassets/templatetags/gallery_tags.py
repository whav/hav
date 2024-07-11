import logging
import math
from dataclasses import dataclass
from typing import List, Union

from django import template
from django.db.models import F
from django.templatetags.static import static
from django.urls import reverse

from hav.apps.accounts.models import User
from hav.apps.accounts.permissions import can_view_media
from hav.apps.archive.models import ArchiveFile
from hav.apps.media.models import Media
from hav.apps.sets.models import Node
from hav.apps.webassets.models import WebAsset
from hav.utils.imaginary import generate_thumbnail_url

logger = logging.getLogger(__name__)

register = template.Library()

no_public_fallback = static("webassets/no_public_media_available.svg")
no_webasset_fallback = static("webassets/no_image_available.svg")
broken_fallback = static("webassets/no_image_available.svg")


@dataclass
class GalleryItem:
    """Helper class for constructing media galleries"""

    media: Media
    webasset: WebAsset
    archive_file: ArchiveFile


def can_view_media_webassets(user, media):
    return can_view_media(user, media)


@register.inclusion_tag("webassets/tags/media_tile.html", takes_context=True)
def media_tile(
    context,
    gallery_item: GalleryItem = None,
    media: Media = None,
    webasset=None,
    display_title: bool = True,
):
    if not any([gallery_item, media]):
        raise ValueError(
            "Either media or gallery_item must be passed to this templatetag."
        )

    archivefile = None

    # if passed a gallery item all data is pulled from there
    if gallery_item:
        media = gallery_item.media
        webasset = gallery_item.webasset
        archivefile = gallery_item.archive_file

    if webasset is None:
        webasset = media.primary_image_webasset

    if archivefile is None:
        archivefile = webasset.archivefile

    user = context.get("user")
    if user.is_authenticated:
        assert isinstance(user, User)

    collection = media.collection

    ctx = {
        "href": reverse(
            "hav:media_view",
            kwargs={"collection_slug": collection.slug, "media_pk": media.pk},
        ),
        "webasset": webasset,
        "media": media,
        "title": media.title if display_title else "",
        "user": user,
        "archivefile": archivefile,
    }
    return ctx


@register.inclusion_tag("webassets/tags/node_tile.html", takes_context=True)
def node_tile(context, node: Node):
    media = node.get_representative_media()
    collection = node.get_collection()

    webasset = None
    if media:
        webasset = media.primary_image_webasset

    return {
        "href": reverse(
            "hav:folder_view",
            kwargs={"collection_slug": collection.slug, "node_pk": node.pk},
        ),
        "webasset": webasset,
        "node": node,
        "media": media,
        "user": context.get("user"),
    }


@register.simple_tag(takes_context=True)
def thumbnail_url(context, object: Union[Media, Node], webasset: WebAsset = None):
    if object is None:
        return no_webasset_fallback

    if isinstance(object, Node):
        media = object.get_representative_media()
    else:
        media = object

    if not media:
        return no_webasset_fallback

    if webasset is None:
        webasset = media.primary_image_webasset
    user = context.get("user")
    can_view = can_view_media_webassets(user, media)

    if webasset:
        if can_view:
            thumbnail_url = generate_thumbnail_url(
                webasset,
                width=300,
                height=None,
                operation="thumbnail",
            )
        else:
            thumbnail_url = no_public_fallback
    else:
        thumbnail_url = no_webasset_fallback

    return thumbnail_url


@register.simple_tag(takes_context=True)
def thumbnail_aspect_ratio(context, webasset: WebAsset):
    user = context.get("user")
    media = webasset.archivefile.media
    can_view_media_webassets(user, media)
    return webasset.aspect_ratio


@register.simple_tag(takes_context=True)
def thumbnail_width(
    context, webasset: WebAsset, media: Media = None, base: int = 150, unit: str = "px"
):
    default = f"{base}{unit}"

    if webasset is None:
        logger.warning(
            f"Invalid use of tag thumbnail_width: no webasset supplied {context}"
        )
        return default

    user = context.get("user")

    if media is None:
        media = webasset.archivefile.media

    # TODO: What is the permission check doing here?
    can_view = can_view_media_webassets(user, media)

    if can_view and webasset and webasset.aspect_ratio:
        width = math.floor(math.sqrt(48000 * webasset.aspect_ratio))
        return f"{width}{unit}"

    return default


@register.inclusion_tag("webassets/tags/icons.html")
def icons(object: Union[Node, Media]):
    icons = []
    if isinstance(object, Node):
        icons.append("node")
    elif isinstance(object, Media):
        if object.primary_file:
            mime = object.primary_file.mime_type
            if mime:
                icons.append(mime.split("/")[0])
        # TODO: protected
        if object.currently_under_embargo:
            icons.append("embargo")
        if object.is_private:
            icons.append("locked")

    return {"icons": icons}


@register.inclusion_tag("ui/components/gallery/default.html", takes_context=True)
def gallery(context, media_qs: List[Media], display_type=None):
    media_pks = [m.pk for m in media_qs]
    image_webassets = (
        WebAsset.objects.filter(
            archivefile__media__in=media_pks, mime_type__istartswith="image/"
        )
        .annotate(media_id=F("archivefile__media"))
        .prefetch_related("archivefile")
    )
    image_webassets_by_media_id = {wa.media_id: wa for wa in image_webassets}
    gallery_items = []
    for media in media_qs:
        webasset = image_webassets_by_media_id[media.pk]
        gallery_items.append(GalleryItem(media, webasset, webasset.archivefile))

    # TODO: is it really a good idea to clobber the global context?
    context.update({"gallery_items": gallery_items, "display_type": display_type})
    return context
