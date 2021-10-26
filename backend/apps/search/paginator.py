from django.core.paginator import Paginator, Page


class SearchPaginator(Paginator):
    def __init__(self, search_results, *args, **kwargs):
        super().__init__(search_results, *args, **kwargs)
        self._result = search_results
        self.nbHits = self._result["nbHits"]

    @property
    def count(self):
        return self.nbHits

    def page(self, number):
        # this is overridden to prevent any slicing of the object_list
        # we already have the right list
        number = self.validate_number(number)
        return Page(self._result.get("hits", []), number, self)
