from django.conf import settings
from . import BaseSource
import requests

SKOSMOS_URL = getattr(
    settings,
    'SKOSMOS_API_URL',
    "https://skosmos-hav.aussereurop.univie.ac.at/rest/v1/"
)

headers = {'Accept': 'application/json'}

def skosmos_get(action, params={}):
    response = requests.get(f'{SKOSMOS_URL}{action}', params=params, headers=headers)
    return response.json()


class Source(BaseSource):

    def get_all(self):
        return []

    def get(self, ref):
        return skosmos_get('data', params={"uri": ref})

    def search(self, query):
        return skosmos_get('search', params={"query": query, "lang": "en"})
