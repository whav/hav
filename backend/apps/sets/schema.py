import graphene

from graphene_django.types import DjangoObjectType

from .models import Node
from apps.tags.schema import TagType


class NodeType(DjangoObjectType):

    children = graphene.List(lambda: NodeType)
    ancestors = graphene.List(lambda: NodeType)
    tags = graphene.List(TagType)

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


class Query(object):
    node = graphene.Field(
        NodeType, nodeID=graphene.String(), collection_slug=graphene.String()
    )

    def resolve_node(self, info, nodeID, collection_slug):
        if nodeID:
            return Node.objects.get(pk=nodeID)
        if collection_slug:
            return Node.objects.get(collection__slug=collection_slug)
        raise NotImplementedError()
