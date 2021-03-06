from rest_framework import serializers
from apps.hav_collections.models import Collection
from apps.sets.models import Node


class CollectionSerializer(serializers.ModelSerializer):

    root_node = serializers.HyperlinkedRelatedField(
        view_name="api:public:node_detail",
        lookup_url_kwarg="node_id",
        read_only=True,
    )

    class Meta:
        model = Collection
        fields = ["name", "short_name", "slug", "root_node"]


class SimpleNodeSerializer(serializers.ModelSerializer):
    url = serializers.HyperlinkedIdentityField(
        view_name="api:public:node_detail",
        lookup_url_kwarg="node_id",
        source="id",
        read_only=True,
    )

    class Meta:
        model = Node
        fields = ["id", "name", "url"]


class NodeSerializer(SimpleNodeSerializer):

    children = SimpleNodeSerializer(many=True, read_only=True)
    ancestors = SimpleNodeSerializer(
        many=True, source="collection_ancestors", read_only=True
    )
    collection = CollectionSerializer(source="get_collection")

    class Meta(SimpleNodeSerializer.Meta):
        model = Node
        fields = SimpleNodeSerializer.Meta.fields + [
            "description",
            "display_type",
            "children",
            "ancestors",
            "collection",
        ]
