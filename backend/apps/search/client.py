from django.conf import settings
import meilisearch

from apps.media.models import Media
from apps.sets.models import Node

url = settings.MEILISEARCH_URL
master_key = settings.MEILISEARCH_KEY
index = settings.MEILISEARCH_INDEX


def get_client():
    return meilisearch.Client(url, apiKey=master_key)


def get_index():
    return get_client().index(index)


def search(query, node=None, offset=0):
    search_filters = ""

    if node:
        search_filters += f"parents = {node}"

    # build valid search options
    search_options = {
        "matches": True,
        "attributesToCrop": ["*"],
        "cropLength": 200,
        "attributesToHighlight": ["*"],
        "offset": offset,
        "limit": 20,
    }
    if search_filters:
        search_options.update({"filter": search_filters})

        index = get_index()
        response = index.search(query, search_options)
        hits = response.get("hits", [])

        # get all folder and media pks in one go
        media_pks = []
        node_pks = []
        for hit in hits:
            type = hit.get("type")
            pk = hit.get("pk")
            if type == "media":
                media_pks.append(pk)
            elif type == "folder":
                node_pks.append(pk)
            else:
                raise NotImplementedError(
                    f'Unknown type "{type}" returned from search query.'
                )

        # and fetch in one query per type
        media_items = {
            media.pk: media
            for media in Media.objects.filter(pk__in=media_pks)
            .prefetch_related("collection")
            .prefetch_related("files__webasset_set", "collection")
        }
        nodes = {node.pk: node for node in Node.objects.filter(pk__in=node_pks)}

        for hit in hits:
            type = hit.get("type")
            pk = hit.get("pk")
            if type == "media":
                m = media_items[pk]
            elif type == "folder":
                m = nodes[pk].get_representative_media()

            hit.update({"object": m})

        return response
