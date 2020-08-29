import graphene

from apps.hav_collections.schema import Query as CollectionQuery
from apps.media.schema import Query as MediaQuery
from apps.sets.schema import Query as NodesQuery


class Query(CollectionQuery, MediaQuery, NodesQuery, graphene.ObjectType):
    # This class will inherit from multiple Queries
    # as we begin to add more apps to our project
    pass


schema = graphene.Schema(query=Query)
