from pycountry import languages

from . import BaseSource

def language_to_output(l):
    return l.alpha_3, l.name

def get_language(ref):
    return languages.get(alpha_3=ref)

class Source(BaseSource):

    def get_all(self):
        return map(language_to_output, languages)

    def get(self, ref):
        return language_to_output(get_language(ref))

    def search(self, query):
        return []

