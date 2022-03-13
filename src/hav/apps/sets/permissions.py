from hav.apps.accounts.models import User

from .models import Node


def can_edit_node(user: User, node: Node):
    collection = node.get_collection()
    return collection.is_admin(user)
