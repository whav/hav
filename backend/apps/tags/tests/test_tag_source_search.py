from django.test import SimpleTestCase
from apps.tags.sources import search_tag_sources
from dataclasses import dataclass


@dataclass
class SearchResult:
    name: str
    source: str
    source_ref: str


class TestSourceSearch(SimpleTestCase):

    query = "nepal"

    def test_search(self):
        results = search_tag_sources(self.query)
        self.assertIsInstance(results, list)
        for r in results:
            SearchResult(**r)

        sources = {r["source"] for r in results}
        # I know that these sources return something for the query 'nepal'
        expected_sources = ["countries", "skosmos", "languages"]
        for s in expected_sources:
            self.assertIn(s, sources)
