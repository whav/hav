from django.test import SimpleTestCase
from django.conf import settings
from hav.apps.tags.sources.skosmos import Source
from hav.apps.tags.sources import TAG_LABEL_TO_SOURCE

import pytest


@pytest.mark.skip("Skosmos not working")
class TestSkosmosSource(SimpleTestCase):

    nepal = "http://skos.um.es/unescothes/C02700"
    skosmos_settings = settings.TAGGING_SOURCES["skosmos"]["options"]

    def setUp(self):
        self.source = TAG_LABEL_TO_SOURCE["skosmos"]

    def test_search(self):
        results = self.source.search("Nepa*")
        self.assertIn(self.nepal, [r.source_ref for r in results])

    def test_detail(self):
        data = self.source.get(self.nepal)
        self.assertEqual(self.nepal, data["graph"][0]["uri"])

    def test_source(self):
        skosmos = Source("skosmos", **self.skosmos_settings)
        res = skosmos.search("Nepa")
