from django.test import SimpleTestCase
from apps.tags.sources import search_tag_sources


class TestSourceSearch(SimpleTestCase):

    query = "nepal"

    def test_search(self):
        self.assertIsNotNone(search_tag_sources(self.query))
