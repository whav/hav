from importlib import import_module


class BaseSource(object):

    def get_all(self):
        raise NotImplementedError()

    def search(self, query):
        raise NotImplementedError()

    def get(self, ref):
        raise NotImplementedError()


# the code below should probably live somewhere else
# AppConfig? settings.py?
def _import_source(label):
    source_pkg = import_module(f'.{label}', 'apps.tags.sources')
    source_class = getattr(source_pkg, 'Source')
    return source_class


TAGGING_SOURCES = {
    'languages': 'iso639_3',
    'countries': 'iso3166'
}

TAG_LABEL_TO_SOURCE = {
    k: _import_source(v)() for k, v in TAGGING_SOURCES.items()
}
