from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import serializers

from apps.media.models import Media


class MediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = ('id', 'title', 'description')


class SearchView(APIView):
    def get(self, request, format=None):
        query = request.GET.get('query', '')
        print(query)
        # TODO: stuff like this:
        from django.contrib.postgres.search import SearchVector
        media_hits  = Media.objects.annotate(search=SearchVector('title', 'description', 'collection__name', 'set__name')).filter(
            search=query)
        media_serializer = MediaSerializer(media_hits, many=True)
        return Response({
            'count': 0,
            'results': media_serializer.data
        })
