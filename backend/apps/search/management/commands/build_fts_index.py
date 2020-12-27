import time
from enum import Enum
from typing import List
import meilisearch
from django.core.management.base import BaseCommand
from django.utils.functional import cached_property
from pydantic import BaseModel

from apps.media.models import Media
from apps.sets.models import Node

from ...client import get_client, get_index

class ItemType(str, Enum):
    folder = 'folder'
    media = 'media'


class SearchIndexItem(BaseModel):
    id: str
    title: str
    additional_titles: List[str] = []
    body: str

    type: ItemType
    pk: int
    parents: List[int] = []
    last_update: float


searchable_attributes = [
      'title',
      'additional_titles',
      'body',
]

class Command(BaseCommand):
    help = "Re-index everything!"

    items = []
    media_pks = set()

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
        except meilisearch.errors.MeiliSearchApiError:
            pass

        self.client.create_index('hav')
        self.wait_for_processing(self.index.add_documents([i.dict() for i in self.items]))

        self.wait_for_processing(self.index.update_searchable_attributes(searchable_attributes))


    def index_collection(self, root_node):
        type = ItemType.folder
        for node in root_node.get_descendants().iterator():
            ancestors = node.get_ancestors().values_list('pk', flat=True)
            item = SearchIndexItem(
                id=f'{type}_{node.pk}',
                type=type,
                pk=node.pk,
                title=node.name,
                body=node.description,
                last_update=time.time(),
                parents=list(ancestors)
            )
            self.items.append(item)

    def index_media(self, media):
        if media.pk in self.media_pks:
            return

        type = ItemType.media
        ancestors = media.set.get_ancestors().values_list('pk', flat=True)
        parents = [*list(ancestors), media.set.pk]
        index_item = SearchIndexItem(
            id=f'{type}_{media.pk}',
            type=type,
            pk=media.pk,
            title=media.title,
            additional_titles=[media.original_media_identifier] if media.original_media_identifier else [],
            body=media.description,
            last_update=time.time(),
            parents=parents
        )
        self.items.append(index_item)
        self.media_pks.add(media.pk)

    def wait_for_processing(self, response):
        update_id = response.get('updateId')
        while True:
            response = self.index.get_update_status(update_id)
            status = response.get('status')
            if status == 'processed':
                break
            if status == 'failed':
                raise ValueError(response.get('error'), 'Operation failed.')
            elif status == 'enqueued':
                time.sleep(0.5)
                continue
            raise NotImplementedError(f'Unknown status {status}.')


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
