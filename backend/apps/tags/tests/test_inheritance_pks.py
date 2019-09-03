from django.test import TestCase
from ..models import Tag, ManagedTag, CollectionTag
from apps.hav_collections.models import Collection
from itertools import permutations, chain
import string
from random import choices, shuffle, sample, choice
from ..fields import SingleTagSelectField, MultipleTagSelectField
from ..sources import TAGGING_SOURCES
from django import forms

letters = list(string.ascii_lowercase)

three_letter_words = [''.join(l) for l in permutations(letters, 3)]


def save_tags(tags):
    created = []
    for t in tags:
        t.save()
        created.append(t)
    return created


class TestTags(TestCase):

    size = 5

    def setUp(self):
        sources = list(TAGGING_SOURCES.values())
        managed_tags = [
            ManagedTag(name=n, source=choice(sources), source_ref=n) for n in sample(three_letter_words, k=self.size)
        ]
        self.collection = Collection.objects.create(name='Test Collection', short_name='test')
        collection_tags = [
            CollectionTag(name=n, collection=self.collection) for n in sample(three_letter_words, k=self.size)
        ]

        bare_tags = [Tag(name=n) for n in sample(three_letter_words, k=self.size)]
        all_tags = managed_tags + collection_tags + bare_tags
        # shuffle the tags
        shuffle(all_tags)
        save_tags(all_tags)

        self.managed_tags = ManagedTag.objects.all()
        self.collection_tags = CollectionTag.objects.all()
        special_tag_pks = list(self.managed_tags.values_list('pk', flat=True)) + \
                          list(self.collection_tags.values_list('pk', flat=True))

        self.bare_tags = Tag.objects.all().exclude(pk__in=special_tag_pks)

    def test_tag_creation(self):
        self.assertEqual(
            self.managed_tags.count(), self.size
        )
        self.assertEqual(self.managed_tags.count(), self.size)
        self.assertEqual(Tag.objects.count(), self.size * 3)

    def test_pk_equality(self):
        """
        Just to test if the assumption is correct that
        inherited models share the pk with their parent
        """
        for tag in chain(self.managed_tags, self.collection_tags):
            self.assertEqual(tag.pk, tag.tag_ptr.pk)

    def test_tag_manager(self):
        managed_tags = list(Tag.objects.select_subclasses(ManagedTag).exclude(managedtag__isnull=True))
        self.assertEqual(len(managed_tags), self.managed_tags.count())

        collection_tags = list(Tag.objects.select_subclasses(CollectionTag).exclude(managedtag__isnull=True))
        self.assertEqual(len(collection_tags), self.collection_tags.count())

    def assertEqualChoices(self, fieldA, fieldB):
        fieldA_choices = set([x for x in fieldA.choices])
        fieldB_choices = set([x for x in fieldB.choices])
        # print(fieldA_choices, fieldB_choices)
        self.assertEqual(fieldA_choices, fieldB_choices)

    def test_single_tag_field(self):
        tag_field = SingleTagSelectField([])
        model_field = forms.ModelChoiceField(Tag.objects.all().select_subclasses())
        self.assertEqualChoices(tag_field, model_field)

        for key, val in TAGGING_SOURCES.items():
            tag_field = SingleTagSelectField([key])
            model_field = forms.ModelChoiceField(ManagedTag.objects.filter(source=val).order_by('pk'))
            self.assertEqualChoices(tag_field, model_field)

