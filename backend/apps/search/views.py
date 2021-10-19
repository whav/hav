from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import serializers
from hav_utils.imaginary import generate_thumbnail_url
from apps.media.models import Media
from apps.sets.models import Node

from .client import get_index


class QuerySerializer(serializers.Serializer):
    query = serializers.CharField(required=True)
    node = serializers.PrimaryKeyRelatedField(
        queryset=Node.objects.all(), required=False
    )


class MediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = ("id", "title", "description")


class SearchView(APIView):
    def get(self, request, format=None):
        query_serializer = QuerySerializer(data=request.GET)
        query_serializer.is_valid()
        query = query_serializer.data.get("query")
        node = query_serializer.data.get("node")

        search_filters = ""
        if node:
            search_filters += f"parents = {node}"

        # build valid search options
        search_options = {"matches": True, "attributesToCrop": ["*"], "cropLength": 200}
        if search_filters:
            search_options.update({"filters": search_filters})

        index = get_index()
        response = index.search(query, search_options)
        hits = response.get("hits", [])

        # get all folder and media pks in one go
        media_pks = []
        node_pks = []
        for hit in hits:
            type = hit.get("type")
            pk = hit.get("pk")
            if type == "media":
                media_pks.append(pk)
            elif type == "folder":
                node_pks.append(pk)
            else:
                raise NotImplementedError(
                    f'Unknown type "{type}" returned from search query.'
                )

        # and fetch in one query per type
        media_items = {
            media.pk: media for media in Media.objects.filter(pk__in=media_pks)
        }
        nodes = {node.pk: node for node in Node.objects.filter(pk__in=node_pks)}

        # decorate search results with thumbnails
        for hit in hits:
            type = hit.get("type")
            pk = hit.get("pk")
            if type == "media":
                m = media_items[pk]
            elif type == "folder":
                m = nodes[pk].get_representative_media()

            asset = m.primary_image_webasset
            if asset:
                formatted = hit.pop("_formatted", {})
                hit.update(
                    {
                        "thumbnail": generate_thumbnail_url(
                            asset,
                            width=300,
                            height=None,
                            operation="thumbnail",
                            user=request.user,
                        )
                    }
                )
                hit.update(formatted)

        return Response(response)
