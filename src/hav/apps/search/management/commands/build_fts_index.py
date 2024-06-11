import meilisearch
from django.core.management.base import BaseCommand
from django.utils.functional import cached_property

from hav.apps.media.models import Media
from hav.apps.sets.models import Node

from ...client import get_client, get_index
from ...indexer.media import index as index_media
from ...indexer.nodes import index as index_node
from ...utils import wait_for_processing

searchable_attributes = [
    "title",
    "additional_titles",
    "body",
    "tags",
    "location_tags",
    "creation_years",
]

filterable_attributes = [
    "parents",
    "creators",
    "creation_years",
]


class Command(BaseCommand):
    help = "Re-index everything!"

    items = []

    # this would only be relevant if we include many2many-relations between media<>set (and use them a lot)
    # media_pks = set()

    def __init__(self, *args, **kwargs):
        super(*args, **kwargs)
        self._client = get_client()
        self._index = get_index()

    @cached_property
    def client(self):
        return self._client

    @property
    def index(self):
        return self._index

    def index_items(self):
        # attempt to delete index
        try:
            self.index.delete()
            print(f"Deleting existing index: {self.index}")
            print("=" * 30)
        except meilisearch.errors.MeiliSearchApiError:
            pass

        # self.client.create_index("hav")  # needed?!
        wait_for_processing(
            self.index,
            self.index.add_documents([i.dict() for i in self.items]),
            progress_to_stdout=True,
        )

        wait_for_processing(
            self.index,
            self.index.update_searchable_attributes(searchable_attributes),
            progress_to_stdout=True,
        )

        self.index.update_filterable_attributes(filterable_attributes)

    def create_and_append_index_items(self, items, type=None):
        total = items.count()
        print("\n", "---" * 20)
        for i, item in enumerate(items.iterator()):
            i += 1
            if type == "node":
                _item = index_node(item)
            elif type == "media":
                # this would only be relevant if we include many2many-relations between media<>set (and use them a lot)
                # if media.pk not in self.media_pks:
                #      self.index_media(media)
                #      self.media_pks.add(media.pk)
                _item = index_media(item)
            else:
                print(f"SKIPPING: Unknown item type: {type}")
                break

            if i == 1 or i % 100 == 0 or i == total:
                print(f"Pre-processing {i} of {total} {type}: {item}")

            self.items.append(_item)

    def handle(self, *args, **options):
        # index nodes one collection at a time
        root_nodes = Node.get_collection_roots()
        for i, root_node in enumerate(root_nodes):
            assert (
                root_node in Node.get_collection_roots()
            ), "Not a collection root node."  # double check?!
            print(
                f"Processing {i+1} of {root_nodes.count()} collections: {root_node.name}"
            )
            self.create_and_append_index_items(root_node.get_descendants(), type="node")

        # index media items
        media_entries = Media.objects.select_related("collection", "set")
        self.create_and_append_index_items(media_entries, type="media")

        if self.items:
            self.index_items()
        else:
            print("Nothing to index")
