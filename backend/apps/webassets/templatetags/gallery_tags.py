import math
from functools import lru_cache
from datetime import date
from typing import Union
from django import template
from apps.media.models import Media
from apps.accounts.models import User
from apps.sets.models import Node
from apps.webassets.models import WebAsset
from hav_utils.imaginary import generate_thumbnail_url
from django.urls import reverse
from django.templatetags.static import static

register = template.Library()

no_public_fallback = static("webassets/no_public_media_available.svg")
no_webasset_fallback = static("webassets/no_image_available.svg")


@lru_cache(maxsize=1, typed=True)
def can_view_media_webassets(user, media):
    has_active_embargo = (
        media.embargo_end_date and media.embargo_end_date >= date.today()
    )
    is_private = media.is_private

    if is_private or has_active_embargo:
        return False

    return True


@register.inclusion_tag("webassets/tags/media_tile.html", takes_context=True)
def media_tile(context, media: Media, display_title: bool = True):
    assert isinstance(media, Media)

    user = context.get("user")
    if user.is_authenticated:
        assert isinstance(user, User)

    webasset = media.primary_image_webasset
    collection = media.collection

    return {
        "href": reverse(
            "hav:media_view",
            kwargs={"collection_slug": collection.slug, "media_pk": media.pk},
        ),
        "webasset": webasset,
        "media": media,
        "title": media.title if display_title else "",
    }


@register.inclusion_tag("webassets/tags/node_tile.html", takes_context=True)
def node_tile(context, node: Node):
    assert isinstance(node, Node)

    media = node.get_representative_media()
    collection = node.get_collection()
    webasset = media.primary_image_webasset

    return {
        "href": reverse(
            "hav:folder_view",
            kwargs={"collection_slug": collection.slug, "node_pk": node.pk},
        ),
        "webasset": webasset,
        "node": node,
        "media": media,
    }


@register.simple_tag(takes_context=True)
def thumbnail_url(context, object: Union[Media, Node], webasset: WebAsset = None):

    media = object

    if isinstance(object, Node):
        media = object.get_representative_media()

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
def thumbnail_width(context, webasset: WebAsset, base: int = 150, unit: str = "px"):
    user = context.get("user")
    media = webasset.archivefile.media
    can_view = can_view_media_webassets(user, media)

    if can_view and webasset and webasset.aspect_ratio:
        width = math.floor(math.sqrt(48000 * webasset.aspect_ratio))
        return f"{width}{unit}"

    return f"{base}{unit}"


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
        if object.embargo_end_date and object.embargo_end_date >= date.today():
            # TODO embargo icon
            icons.append("embargo")
            pass
        if object.is_private:
            icons.append("locked")

    return {"icons": icons}
