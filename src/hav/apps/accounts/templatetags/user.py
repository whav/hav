from logging import getLogger

from django import template

from hav.apps.accounts.permissions import is_collection_admin

register = template.Library()

logger = getLogger(__name__)


@register.simple_tag(takes_context=True)
def user_is_collection_admin(context):
    return is_collection_admin(context["user"], context["collection"])
