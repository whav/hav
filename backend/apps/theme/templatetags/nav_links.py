from django import template

register = template.Library()


@register.inclusion_tag("ui/components/nav/link.html", takes_context=True)
def active_link(context, title, to, fuzzy=False):
    request = context.get("request")
    active = request.path == to
    if fuzzy and request.path.startswith(to):
        active = True
    return {"active": active, "href": to, "title": title}
