from django.conf import settings
import meilisearch

url = settings.MEILISEARCH_URL
master_key = settings.MEILISEARCH_KEY
index = settings.MEILISEARCH_INDEX


def get_client():
    return meilisearch.Client(url, apiKey=master_key)


def get_index():
    return get_client().index(index)
