from pycountry import countries

from . import BaseSource, TagSourceResult


def get_country(ref):
    return countries.get(alpha_3=ref)


class Source(BaseSource):
    def country_to_output(self, country):
        return TagSourceResult(
            name=country.name, source=self.source, source_ref=country.alpha_3
        )

    def get_all(self):
        return map(self.country_to_output, countries)

    def get(self, ref):
        return self.country_to_output(get_country(ref))

    def search(self, query):
        try:
            results = countries.search_fuzzy(query)
        except LookupError:
            results = []
        return map(self.country_to_output, results)
