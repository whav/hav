import graphene

from apps.hav_collections.schema import Query as CollectionQuery


class Query(CollectionQuery, graphene.ObjectType):
    # This class will inherit from multiple Queries
    # as we begin to add more apps to our project
    pass

schema = graphene.Schema(query=Query)

