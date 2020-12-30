from django.apps import AppConfig


class SearchConfig(AppConfig):
    name = "search"

    def ready(self):
        # print('Testing meilisearch connection...')
        from .client import get_client, get_index
        client = get_client()
        index = get_index()
