import graphene

from graphene_django.types import DjangoObjectType

from .models import Collection

class CollectionType(DjangoObjectType):

    browseable = graphene.Boolean(required=True)
    searchable = graphene.Boolean()

    def resolve_browseable(self, *args, **kwargs):
        return self.root_node is not None

    def resolve_searchable(self, info, *args, **kwargs):
        from django.conf import settings
        return settings.DEBUG

    class Meta:
        model = Collection
        only_fields = ('name', 'short_name', 'slug', 'root_node', 'id')


class Query(object):
    collections = graphene.List(CollectionType)

    def resolve_collections(self, info, **kwargs):
        return Collection.objects.filter(public=True).order_by('root_node__numchild', 'short_name')

