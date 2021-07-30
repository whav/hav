import math
from typing import Union
from django import template
from apps.media.models import Media
from apps.accounts.models import User
from apps.sets.models import Node
from apps.webassets.models import WebAsset
from hav_utils.imaginary import generate_thumbnail_url
from django.urls import reverse

register = template.Library()


@register.inclusion_tag("webassets/tags/media_tile.html", takes_context=True)
def media_tile(context, media: Media):
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
        "thumbnail_url": generate_thumbnail_url(webasset, user=user),
    }


@register.inclusion_tag("webassets/tags/node_tile.html", takes_context=True)
def node_tile(context, node: Node):
    assert isinstance(node, Node)

    user = context.get("user")

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
        "thumbnail_url": generate_thumbnail_url(webasset, user=user),
    }


@register.simple_tag(takes_context=True)
def thumbnail_url(context, webasset: WebAsset):
    return generate_thumbnail_url(
        webasset,
        width=300,
        height=None,
        operation="thumbnail",
    )


@register.simple_tag
def thumbnail_aspect_ratio(webasset: WebAsset):
    return webasset.aspect_ratio


@register.simple_tag
def thumbnail_width(webasset: WebAsset, base: int = 150, unit: str = "px"):
    if webasset.aspect_ratio:
        width = math.floor(math.sqrt(48000 * webasset.aspect_ratio))
        return f"{width}{unit}"
    return ""


@register.inclusion_tag("webassets/tags/icons.html")
def icons(object: Union[Node, Media]):

    if isinstance(object, Node):
        print(object)
    elif isinstance(object, Media):
        print("media", object)
    return {"icons": [type(object)]}
