from pycountry import languages

from . import BaseSource


def get_language(ref):
    return languages.get(alpha_3=ref)


class Source(BaseSource):

    def build_result(self, language):
        return self.get_value(language.alpha_3), language.name

    def get_all(self):
        return map(self.build_result, languages)

    def get(self, ref):
        return self.build_result(get_language(ref))

    def search(self, query):
        # languages.
        results = filter(lambda l: l.name.lower().startswith(query), languages)
        return map(self.build_result, results)


