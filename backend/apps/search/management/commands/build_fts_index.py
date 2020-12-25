import time
from enum import Enum
from typing import List
import meilisearch
from django.core.management.base import BaseCommand
from pydantic import BaseModel

from apps.media.models import Media
from apps.sets.models import Node


class ItemType(str, Enum):
    folder = 'folder'
    media = 'media'


class SearchIndexItem(BaseModel):
    id: str
    title: str
    additional_titles: List[str] = []
    body: str

    type: ItemType
    last_update: float


class Command(BaseCommand):
    help = "Reindex everything!"

    items = []
    media_pks = set()

    def index_items(self):
        # import ipdb;
        # ipdb.set_trace()
        client = meilisearch.Client('http://127.0.0.1:7700')
        # attempt to delete index
        try:
            client.index('hav').delete()
        except meilisearch.errors.MeiliSearchApiError:
            pass

        client.create_index('hav')
        index = client.index('hav')
        index.add_documents([i.dict() for i in self.items])

    def index_collection(self, root_node):
        type = ItemType.folder
        for node in root_node.get_descendants().iterator():
            item = SearchIndexItem(id=f'{type}_{node.pk}', type=type,title=node.name, body=node.description, last_update=time.time())
            self.items.append(item)

    def index_media(self, media):
        if media.pk in self.media_pks:
            return

        type = ItemType.media

        index_item = SearchIndexItem(
            id=f'{type}_{media.pk}',
            type=type,
            title=media.title,
            additional_titles=[media.original_media_identifier] if media.original_media_identifier else [],
            body=media.description,
            last_update=time.time()
        )
        self.items.append(index_item)
        self.media_pks.add(media.pk)

    def handle(self, *args, **options):
        # index nodes
        root_nodes = Node.get_collection_roots()
        for root in root_nodes:
            self.index_collection(root)

        # index media items
        media_entries = Media.objects.iterator()
        for media in media_entries:
            if media.pk not in self.media_pks:
                self.index_media(media)

        self.index_items()
