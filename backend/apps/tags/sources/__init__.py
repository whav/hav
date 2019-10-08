from importlib import import_module
from django.conf import settings

class BaseSource:

    def __init__(self, source_id):
        self.source = source_id

    def get_all(self):
        raise NotImplementedError()

    def search(self, query):
        raise NotImplementedError()

    def get(self, ref):
        raise NotImplementedError()

    def get_value(self, ref):
        return f'{self.source}||{ref}'


source = getattr(settings, 'TAGGING_SOURCE', {})

TAGGING_SOURCE_CHOICES = []
TAG_LABEL_TO_SOURCE = {}

for key, source_settings in settings.TAGGING_SOURCES.items():
    TAGGING_SOURCE_CHOICES.append((key, key))
    module_string, source_class = source_settings['source'].rsplit('.', 1)
    module = import_module(module_string)
    SourceClass = getattr(module, source_class)
    source_options = source_settings.get('options', {})
    TAG_LABEL_TO_SOURCE[key] = SourceClass(key, **source_options)


def resolve_source_from_value(value):
    source_key, ref = value.split('||', maxsplit=1)
    return TAG_LABEL_TO_SOURCE[source_key], ref
