import graphene

from graphene_django.types import DjangoObjectType

from .models import Collection

class CollectionType(DjangoObjectType):
    class Meta:
        model = Collection

class Query(object):
    all_collections = graphene.List(CollectionType)

    def resolve_all_collections(self, info, **kwargs):
        return Collection.objects.all().order_by('root_node__numchild')

