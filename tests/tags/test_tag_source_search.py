from django.test import TestCase
from hav.apps.tags.sources import search_tag_sources, TagSourceResult
from hav.apps.tags.models import search_tags, Tag, TagSource
from hav.apps.hav_collections.models import Collection

import pytest


@pytest.mark.skip("Skosmos not working")
class TestSourceSearch(TestCase):

    query = "nepal"

    def setUp(self) -> None:
        self.collection = Collection.objects.create(name="test", short_name="test")

    def test_source_tag_search(self):
        results = search_tag_sources(self.query)
        self.assertIsInstance(results, list)
        for r in results:
            assert isinstance(r, TagSourceResult)

        sources = {r.source for r in results}
        # I know that these sources return something for the query 'nepal'
        expected_sources = ["countries", "skosmos", "languages"]
        for s in expected_sources:
            self.assertIn(s, sources)

    def test_full_search(self):
        results = search_tags(self.query)
        source_results = search_tag_sources(self.query)
        self.assertEqual(
            results, source_results, "All source results appear in full search"
        )

        tag = Tag.objects.create(name="Nepal", collection=self.collection)
        results = search_tags(self.query, collection=self.collection)
        self.assertEqual(
            [tag.to_search_result(), *source_results],
            results,
            "Created tag appears before source tags in result list",
        )

        tag.delete()
        # construct a tag from a source
        ts = source_results[0]
        tag_source = TagSource.objects.create(
            source=ts.source, source_ref=ts.source_ref
        )
        tag = Tag.objects.create(
            name="Nepal", collection=self.collection, source=tag_source
        )
        results = search_tags(self.query, collection=self.collection)
        self.assertEqual(
            [tag.to_search_result(), *source_results[1:]],
            results,
            "The source tag does not appear in search results after being assigned to a tag.",
        )
