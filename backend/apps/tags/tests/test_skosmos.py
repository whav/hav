from django.test import SimpleTestCase
from django.conf import settings
from ..sources.skosmos import Source
from ..sources import TAG_LABEL_TO_SOURCE


class TestSkosmosSource(SimpleTestCase):

    nepal = "http://skos.um.es/unescothes/C02700"
    skosmos_settings = settings.TAGGING_SOURCES["skosmos"]["options"]

    def setUp(self):
        self.source = TAG_LABEL_TO_SOURCE["skosmos"]

    def test_search(self):
        results = self.source.search("Nepa*")
        # this is brittle as the url is somewhere in the value
        # just create a dumb string and check for existence
        # TODO: Fix me once the source_key||source_id format stabilises
        all_results = " ".join(
            [item for values_and_labels in results for item in values_and_labels]
        )
        self.assertIn(self.nepal, all_results)

    def test_detail(self):
        data = self.source.get(self.nepal)
        self.assertEqual(self.nepal, data["graph"][0]["uri"])

    def test_source(self):
        skosmos = Source("skosmos", **self.skosmos_settings)
        res = skosmos.search("Nepa")
