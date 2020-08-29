from rest_framework.generics import ListAPIView
from rest_framework import serializers
from apps.hav_collections.models import Collection


class CollectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Collection
        fields = ["name", "short_name", "slug"]


class CollectionListView(ListAPIView):
    serializer_class = CollectionSerializer

    def get_queryset(self):
        return Collection.objects.all().order_by("root_node__numchild")
