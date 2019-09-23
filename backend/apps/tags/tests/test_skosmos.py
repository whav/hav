from django.test import SimpleTestCase
from ..sources.skosmos import Source


class TestSkosmosSource(SimpleTestCase):

    nepal = "http://skos.um.es/unescothes/C02700"

    def setUp(self):
        self.source = Source()

    def test_search(self):
        data = self.source.search('Nepa*')
        results = data['results']
        self.assertIn(self.nepal, [r['uri'] for r in results])

    def test_detail(self):
        data = self.source.get(self.nepal)
        self.assertEqual(self.nepal, data["graph"][0]["uri"])



