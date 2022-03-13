import requests
from django.conf import settings

from . import BaseSource, TagSourceResult

headers = {"Accept": "application/json"}


def skosmos_get(url, action, params={}):
    response = requests.get(f"{url}{action}", params=params, headers=headers)
    return response.json()


class Source(BaseSource):
    def __init__(self, *args, **kwargs):
        self.url = kwargs.pop("url")
        super().__init__(*args, **kwargs)

    def build_response(self, item):
        crumbs = [
            item["inScheme"][0]["prefLabel"],
            *[b["prefLabel"] for b in item.get("broader", [])],
        ]

        return TagSourceResult(
            name=item["prefLabel"],
            source=self.source,
            source_ref=item["uri"],
            crumbs=crumbs,
        )

    def get_all(self):
        return []

    def get(self, ref):
        return skosmos_get(self.url, "data", params={"uri": ref})

    def search(self, query):
        response = skosmos_get(
            self.url,
            "search",
            params={
                "query": f"{query}*",
                "lang": "en",
                "unique": True,
                "fields": "broader inScheme",
            },
        )
        results = response.get("results", [])
        return list(map(self.build_response, results))
