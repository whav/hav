from django import template
from django.conf import settings
from django.template.defaultfilters import stringfilter
from django.utils.safestring import mark_safe

from markdown_it import MarkdownIt
from mdit_py_plugins import front_matter

register = template.Library()

mdx_server = settings.MDX_SERVER

md = MarkdownIt().use(front_matter.front_matter_plugin)


@register.filter
@stringfilter
def markdown(md_text):
    html_text = md.render(md_text)
    return mark_safe(html_text)


@register.inclusion_tag("ui/components/mdx.html")
def mdx(content: str):
    import requests

    resp = requests.post(mdx_server, data={"mdx": content})
    js = resp.text
    return {"code": js, "content": content}
