from apps.hav_collections.models import Collection
from apps.tags.models import Tag, TagSource, search_tags
from apps.tags.sources import TagSourceResult
from rest_framework.test import APITestCase
from api.v1.misc_models.serializers import TagSerializer, SimpleTagSerializer

from unittest import skip


@skip
class TagSerializerTests(APITestCase):
    def setUp(self):
        self.collection = Collection.objects.create(name="Testcollection")
        self.bare_tag = Tag.objects.create(name="bare tag", collection=self.collection)
        self.source_tag = TagSource.objects.create(
            source="skosmos", source_ref="http://skos.um.es/unescothes/C02700"
        )
        self.source_tag = Tag.objects.create(
            name="source tag", collection=self.collection, source=self.source_tag
        )

    def testSerializer(self):
        ts = TagSerializer(data={"name": "Testtag"})
        assert ts.is_valid(raise_exception=True)

    def testSerializerFromInstance(self):
        ts = TagSerializer(instance=self.bare_tag)
        assert ts.data
        ts_source = TagSerializer(instance=self.source_tag)
        assert ts_source.data
        data = ts_source.data
        assert data["source"] == "skosmos"
        assert data["source_ref"] == "http://skos.um.es/unescothes/C02700"

    def testTagWithSourceCreate(self):
        data = {
            "name": "Bhutan",
            "source": "skosmos",
            "source_ref": "http://skos.um.es/unescothes/C00366",
        }
        ts = SimpleTagSerializer(data=data, context={"collection": self.collection})
        assert ts.is_valid(raise_exception=True)
        tag = ts.save()
        self.assertIsInstance(tag, Tag)
        self.assertIsInstance(tag.source, TagSource)
        ts = SimpleTagSerializer(data=data)
        assert ts.is_valid(raise_exception=True)

    def testSimpleTagCreate(self):
        data = {"name": "Bhutan", "collection": self.collection.pk}
        ts = SimpleTagSerializer(data=data)
        assert ts.is_valid(raise_exception=True)
        tag = ts.save()
        self.assertIsInstance(tag, Tag)
        self.assertIsNone(tag.source)

    def testTagToResultConversion(self):
        tags = [self.bare_tag, self.source_tag]
        for t in tags:
            r = t.to_search_result()
            self.assertIsInstance(r, TagSourceResult)
            self.assertIsNotNone(r.id)
            # convert back to a tag
            tag = r.to_tag()
            self.assertIsInstance(tag, Tag)
            self.assertEqual(tag.id, str(t.pk))
            self.assertEqual(tag.name, t.name)
            if t.source:
                self.assertEqual(tag.source.source_ref, t.source.source_ref)
                self.assertEqual(tag.source.source, t.source.source)

    def testSourceResults(self):
        source_results = search_tags("Nepal", collection=self.collection)
        for r in source_results:
            self.assertIsInstance(r, TagSourceResult)
            tag = r.to_tag()
            self.assertIsNone(tag.pk)

    def testSimpleSourceTagSerializerUpdate(self):
        serializers_kwargs = {"context": {"collection": self.collection}}
        for index, tag in enumerate([self.bare_tag, self.source_tag]):
            serializer = SimpleTagSerializer(
                data={"id": str(tag.pk), "name": f"urxn{index}"}, **serializers_kwargs
            )
            assert serializer.is_valid()
            new_tag = serializer.save()
            assert new_tag.name == tag.name, "name did not update"

    def testSimpleSourceSerializerCreate(self):
        serializers_kwargs = {"context": {"collection": self.collection}}
        tag_data = [
            {"name": "Testtag"},
            {
                "name": "Testag2",
                "source": "skosmos",
                "source_ref": "http://skos.um.es/unescothes/C00366",
            },
        ]
        for index, td in enumerate(tag_data):
            serializer = SimpleTagSerializer(data=td, **serializers_kwargs)
            assert serializer.is_valid()
            tag = serializer.save()
            self.assertIsInstance(tag, Tag)
            if index == 1:
                self.assertIsInstance(tag.source, TagSource)
