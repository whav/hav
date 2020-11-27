from rest_framework.views import APIView
from rest_framework.response import Response


class SearchView(APIView):
    def get(self, request, format=None):
        # TODO: stuff like this:
        # from django.contrib.postgres.search import SearchVector
        # Media.objects.annotate(search=SearchVector('title', 'description', 'collection__name', 'set__name')).filter(
        #     search='Kathmandu'):
        return Response([])
