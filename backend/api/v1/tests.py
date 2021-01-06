from django.test import TestCase

from apps.accounts.models import User
from apps.hav_collections.models import Collection
from .permissions import has_collection_permission


class CollectionPermissionTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user1 = User.objects.create(username="user1")
        cls.user2 = User.objects.create(username="user2", is_staff=True)
        cls.user3 = User.objects.create(
            username="user3", is_superuser=True, is_staff=True
        )
        cls.collection = Collection.objects.create(
            name="Testcollection", short_name="test"
        )

    def testSuperuserPermissions(self):
        self.assertTrue(has_collection_permission(self.user3, self.collection))
        self.assertTrue(has_collection_permission(self.user3.pk, self.collection.pk))

    def testOtherPermission(self):
        self.assertFalse(
            has_collection_permission(self.user1, self.collection),
            msg="Staff has no collection permissions by default",
        )
        self.assertFalse(has_collection_permission(self.user2, self.collection))

    def testCollectionAdministrators(self):
        self.collection.administrators.set([self.user1])
        self.assertTrue(has_collection_permission(self.user1, self.collection))
