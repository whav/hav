import graphene

from graphene_django.types import DjangoObjectType

from .models import Collection

class CollectionType(DjangoObjectType):
    class Meta:
        model = Collection

class Query(object):
    collections = graphene.List(CollectionType)

    def resolve_collections(self, info, **kwargs):
        return Collection.objects.filter(public=True).order_by('root_node__numchild', 'short_name')

