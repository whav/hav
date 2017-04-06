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
    menuitems = parent.get_children().live().in_menu()

    for menuitem in menuitems:
        menuitem.active = (calling_page.url.startswith(menuitem.url)
                           if calling_page else False)

    try:
        collection_page = Page.objects.get(slug='collections')
        collections = collection_page.get_children().live().in_menu()
        collections_active = calling_page.is_descendant_of(collection_page)
    except Page.DoesNotExist:
        collections = []
        collection_page = None
        collections_active = False

    return {
        'calling_page': calling_page,
        'menuitems': menuitems,
        'collections': collections,
        'collections_active':  collections_active,
        # required by the pageurl tag that we want to use within this template
        'request': context['request'],
        'root_page': context['request'].site.root_page
    }
