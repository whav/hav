from django import template

register = template.Library()


@register.inclusion_tag("ui/components/pagination/paginator.html", takes_context=True)
def paginator(context, page):
    request = context.get("request")
    path = request.path
    query = request.GET.copy()

    def generate_link(page_number):
        query["page"] = page_number
        return f"{path}?{query.urlencode()}"

    ctx = {
        "is_paginated": page.has_other_pages(),
        "paginator": page.paginator,
        "page": page,
        "current_page_number": page.number,
        "pages": [{"page": p, "href": generate_link(p.number)} for p in page.paginator],
    }
    print(ctx)
    # breakpoint()
    return ctx
