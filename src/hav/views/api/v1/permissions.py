from rest_framework.permissions import IsAdminUser
from hav.apps.hav_collections.models import Collection
from hav.apps.accounts.models import User


class IncomingBaseMixin(object):
    permission_classes = (IsAdminUser,)


def has_collection_permission(user, collection):
    if not isinstance(user, User):
        user = User.objects.get(pk=user)
    # short circuit for superusers
    if user.is_superuser:
        return True

    if not isinstance(collection, Collection):
        collection = Collection.objects.get(pk=collection)

    return collection.administrators.filter(pk=user.pk).exists()
