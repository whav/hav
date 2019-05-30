import graphene

from graphene_django.types import DjangoObjectType

from .models import Node

class NodeType(DjangoObjectType):

    children = graphene.List(lambda: NodeType)
    ancestors = graphene.List(lambda: NodeType)

    class Meta:
        model = Node
        only_fields = (
            'name',
            'depth',
            'id',
        )

    def resolve_children(self, info):
        return self.get_children()

    def resolve_ancestors(self, info):
        return self.get_ancestors()

class Query(object):
    node = graphene.Field(NodeType, node_id=graphene.Int())

    def resolve_node(self, info, node_id):
        return Node.objects.get(pk=node_id)






