from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import serializers

from apps.media.models import Media
import meilisearch


class QuerySerializer(serializers.Serializer):
    query = serializers.CharField(required=True)


class MediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = ('id', 'title', 'description')


class SearchView(APIView):
    def get(self, request, format=None):
        query_serializer = QuerySerializer(data=request.GET)
        query_serializer.is_valid()
        query = query_serializer.data.get('query')

        client = meilisearch.Client('http://127.0.0.1:7700')
        index = client.index('hav')
        response = index.search(query)
        return Response(response)


