from django.apps import AppConfig


class SearchConfig(AppConfig):
    name = "hav.apps.search"

    def ready(self):
        from . import signals  # noqa
