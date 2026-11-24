"""
Rich content for node descriptions and flatpages, in plain Markdown.

Archive objects are embedded with image syntax and custom addresses::

    ![Bhaktapur](media:5997)                media tile, links to the media
    [![Kalimpong](media:11615)](node:190)   media tile, links to folder 190
    ![Gangtok](node:84)                     folder tile
    ![](geo:35.6037,82.4853?z=5)            OpenStreetMap map

A paragraph containing nothing but tiles is rendered as a gallery. Links may
point to archive objects as well: [see here](node:190).

Raw HTML is limited to formatting tags without attributes (<b>, <i>, <small>,
<br>, ...), anything else is shown as text.
"""

import re

from django.core.exceptions import ValidationError
from django.template.loader import render_to_string
from django.urls import reverse
from django.utils.safestring import mark_safe
from markdown_it import MarkdownIt
from markdown_it.common.utils import escapeHtml
from mdit_py_plugins.front_matter import front_matter_plugin

from hav.apps.media.models import Media
from hav.apps.sets.models import Node

OBJECT_SCHEMES = ("media:", "node:", "geo:")
OBJECT_RE = re.compile(r"(media|node):(\d+)")
GEO_RE = re.compile(r"geo:(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)(?:\?z=(\d+))?")
ALLOWED_HTML_RE = re.compile(r"</?(?:b|i|em|strong|small|sub|sup|u|s)>|<br\s*/?>", re.I)


class ContentError(Exception):
    pass


def _object(address):
    """media:ID / node:ID -> (kind, object)"""
    m = OBJECT_RE.fullmatch(address)
    if m is None:
        raise ContentError(f"{address} is not a valid address")
    kind, pk = m.groups()
    obj = (Media if kind == "media" else Node).objects.filter(pk=pk).first()
    if obj is None:
        raise ContentError(f"{address} does not exist")
    return kind, obj


def _url(kind, obj):
    collection = obj.collection if kind == "media" else obj.get_collection()
    if collection is None:
        raise ContentError(f"{kind}:{obj.pk} does not belong to a collection")
    if kind == "media":
        kwargs = {"collection_slug": collection.slug, "media_pk": obj.pk}
        return reverse("hav:media_view", kwargs=kwargs)
    kwargs = {"collection_slug": collection.slug, "node_pk": obj.pk}
    return reverse("hav:folder_view", kwargs=kwargs)


def _href(address):
    """Resolve media:ID / node:ID links, other links are kept."""
    if address.startswith(("media:", "node:")):
        return _url(*_object(address))
    return address


def _resolve(src, href):
    """Check an embedded object and resolve its link: (kind, object, href).

    Cheap enough for validation; the template context is built separately.
    """
    if src.startswith("geo:"):
        m = GEO_RE.fullmatch(src)
        if m is None:
            raise ContentError(f"{src} is not a valid address, use geo:LAT,LNG?z=ZOOM")
        return "geo", m.groups(), None
    kind, obj = _object(src)
    return kind, obj, _href(href) if href else _url(kind, obj)


def _component(kind, obj, href, caption):
    """Template and context for a resolved object."""
    if kind == "geo":
        lat, lng, zoom = obj
        context = {"lat": float(lat), "lng": float(lng), "zoom": int(zoom or 5)}
        return "theme/content/map.html", context

    if kind == "media":
        context = {"media": obj, "webasset": obj.primary_image_webasset}
        return "theme/content/media.html", {**context, "href": href, "caption": caption}

    media = obj.get_representative_media()
    return "theme/content/folder.html", {
        "node": obj,
        "media": media,
        "webasset": media.primary_image_webasset if media else None,
        "href": href,
        "caption": caption or obj.name,
    }


def _is_object(token):
    return token.type == "image" and token.attrGet("src").startswith(OBJECT_SCHEMES)


def _objects_rule(state):
    """Attach link targets to linked objects and mark paragraphs of tiles."""
    tokens = state.tokens
    for i, token in enumerate(tokens):
        if token.type != "inline" or not token.children:
            continue

        # [![caption](media:1)](node:2) -> the image remembers the link target
        children, it = [], iter(token.children)
        for child in it:
            if child.type == "link_open":
                image, close = next(it, None), next(it, None)
                if image and close and _is_object(image) and close.type == "link_close":
                    image.meta["href"] = child.attrGet("href")
                    children.append(image)
                    continue
                children.extend(t for t in (child, image, close) if t)
                continue
            children.append(child)
        token.children = children

        only_objects = any(_is_object(c) for c in children) and all(
            _is_object(c)
            or c.type == "softbreak"
            or (c.type == "text" and not c.content.strip())
            for c in children
        )
        if only_objects and tokens[i - 1].type == "paragraph_open":
            tokens[i - 1].meta["objects"] = tokens[i + 1].meta["objects"] = True


def _render_image(self, tokens, idx, options, env):
    token = tokens[idx]
    if not _is_object(token):
        return self.image(tokens, idx, options, env)
    try:
        resolved = _resolve(token.attrGet("src"), token.meta.get("href"))
    except ContentError as e:
        env["errors"].append(str(e))
        return ""
    if not env["render"]:
        return ""
    caption = self.renderInlineAsText(token.children, options, env)
    template, context = _component(*resolved, caption)
    return render_to_string(template, context, request=env.get("request"))


def _render_link_open(self, tokens, idx, options, env):
    token = tokens[idx]
    try:
        token.attrSet("href", _href(token.attrGet("href")))
    except ContentError as e:
        env["errors"].append(str(e))
        token.attrSet("href", "#")
    return self.renderToken(tokens, idx, options, env)


def _render_paragraph(self, tokens, idx, options, env):
    token = tokens[idx]
    if not token.meta.get("objects"):
        return self.renderToken(tokens, idx, options, env)
    return '<div class="gallery">' if token.nesting == 1 else "</div>\n"


def _render_html_inline(self, tokens, idx, options, env):
    html = tokens[idx].content
    if ALLOWED_HTML_RE.fullmatch(html):
        return html
    if html.startswith("<!--"):
        return ""
    env["errors"].append(f"HTML {html} is not supported")
    return escapeHtml(html)


md = MarkdownIt("commonmark", {"html": True}).use(front_matter_plugin).enable("table")
# no raw html blocks: a line starting with a tag (e.g. <br>) is a normal paragraph
md.disable("html_block")
md.core.ruler.push("hav_objects", _objects_rule)
md.add_render_rule("image", _render_image)
md.add_render_rule("link_open", _render_link_open)
md.add_render_rule("paragraph_open", _render_paragraph)
md.add_render_rule("paragraph_close", _render_paragraph)
md.add_render_rule("html_inline", _render_html_inline)


def _render(source, **env):
    env = {"errors": [], "render": True, **env}
    return md.render(source or "", env), env["errors"]


def render_content(source, request=None):
    return mark_safe(_render(source, request=request)[0])


def validate_content(source):
    """Form field validator."""
    errors = _render(source, render=False)[1]
    if errors:
        raise ValidationError(errors)
