from django.test import SimpleTestCase
from apps.tags.models import search_managed_tags


class TestSourceSearch(SimpleTestCase):

    query = "nepal"

    def test_search(self):
        search_managed_tags(self.query)



