from django import template
from django.template.defaultfilters import stringfilter
from django.utils.safestring import mark_safe

from markdown_it import MarkdownIt

register = template.Library()


md = MarkdownIt()


@register.filter
@stringfilter
def markdown(md_text):
    html_text = md.render(md_text)
    return mark_safe(html_text)
