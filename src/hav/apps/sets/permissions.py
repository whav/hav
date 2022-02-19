from .models import Node
from apps.accounts.permissions import is_collection_admin
from apps.accounts.models import User


def can_edit_node(user: User, node: Node):
    collection = node.get_collection()
    return is_collection_admin(user, collection)
