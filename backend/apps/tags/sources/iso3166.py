from pycountry import countries

from . import BaseSource


def country_to_output(l):
    return l.alpha_3, l.name


def get_country(ref):
    return countries.get(alpha_3=ref)


class Source(BaseSource):

    def get_all(self):
        return map(country_to_output, countries)

    def get(self, ref):
        return country_to_output(get_country(ref))

    def search(self, query):
        return []

