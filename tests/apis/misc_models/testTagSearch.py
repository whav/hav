from unittest import skip

from django.urls import reverse
from rest_framework.test import APITestCase

from hav.apps.accounts.models import User
from hav.apps.hav_collections.models import Collection
from hav.apps.tags.models import Tag


@skip
class TagSearchTest(APITestCase):
    def setUp(self):
        self.collection = Collection.objects.create(name="Testcollection")
        self.tag = Tag.objects.create(name="testtag", collection=self.collection)
        self.url = reverse("api:v1:models:tag_autocomplete")
        self.user = User.objects.create_superuser(
            username="tester", email="test@example.org", password="123"
        )
        self.client.force_login(self.user)

    def _search(self, query="", collection=None):
        if not collection:
            collection = self.collection.pk
        return self.client.get(
            self.url, data={"search": query, "collection": collection}
        )

    def testAccess(self):
        self.client.logout()
        resp = self._search()
        self.assertEqual(resp.status_code, 401)

    def testAutocomplete(self):
        response = self._search(self.tag.name)
        self.assertIn(str(self.tag.pk), [r["id"] for r in response.json()])
