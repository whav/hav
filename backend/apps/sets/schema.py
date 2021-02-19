import graphene

from graphene_django.types import DjangoObjectType

from .models import Node
from apps.tags.schema import TagType
from apps.hav_collections.schema import CollectionType

class NodeType(DjangoObjectType):

    children = graphene.List(lambda: NodeType)
    ancestors = graphene.List(lambda: NodeType)
    tags = graphene.List(TagType)

    collection = graphene.Field(CollectionType)
    representative_media = graphene.Field("apps.media.schema.MediaType", required=False)

    class Meta:
        model = Node
        only_fields = (
            "name",
            "description",
            "tags",
            "depth",
            "id",
        )

    def resolve_children(self, info):
        return self.get_children()

    def resolve_ancestors(self, info):
        return self.collection_ancestors

    def resolve_tags(self, info):
        return self.tags.all()

    def resolve_collection(self, info):
        return self.get_collection()


class Query(object):
    node = graphene.Field(
        NodeType, node_id=graphene.String(required=False), collection_slug=graphene.String(required=False)
    )

    def resolve_node(self, info, node_id=None, collection_slug=None, **kwargs):
        if node_id:
            return Node.objects.get(pk=node_id)
        if collection_slug:
            return Node.objects.get(collection__slug=collection_slug)
        raise NotImplementedError()
