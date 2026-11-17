from django import template

from hav.apps.theme import content as _content

register = template.Library()


@register.inclusion_tag("theme/content/content.html", takes_context=True)
def render_content(context, content: str):
    """Markdown plus the allowed components, see hav.apps.theme.content."""
    html = _content.render_content(content, context.get("request"))
    return {"html": html, "has_map": "data-hav-map" in html}
