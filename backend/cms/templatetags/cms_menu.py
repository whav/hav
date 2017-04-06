from django import template
from wagtail.wagtailcore.models import Page
register = template.Library()

@register.assignment_tag(takes_context=True)
def get_site_root(context):
    # NB this returns a core.Page, not the implementation-specific model used
    # so object-comparison to self will return false as objects would differ
    return context['request'].site.root_page


# Retrieves the top menu items - the immediate children of the parent page
# The has_menu_children method is necessary because the bootstrap menu requires
# a dropdown class to be applied to a parent
@register.inclusion_tag('cms/tags/top_menu.html', takes_context=True)
def top_menu(context, parent, calling_page=None):
    # print('Parent', parent)
    # print('Calling Page', calling_page)
    menuitems = parent.get_children().live().in_menu()
    try:
        collections = Page.objects.get(slug='collections').get_children().live().in_menu()
    except Page.DoesNotExist:
        collections = []
    # print('Collections', collections)
    return {
        'calling_page': calling_page,
        'menuitems': menuitems,
        'collections': collections,
        # required by the pageurl tag that we want to use within this template
        'request': context['request'],
        'root_page': context['request'].site.root_page
    }
