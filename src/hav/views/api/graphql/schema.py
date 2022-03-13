import graphene

from hav.apps.archive.schema import Query as ArchivedFilesQuery
from hav.apps.hav_collections.schema import Query as CollectionQuery
from hav.apps.media.schema import Query as MediaQuery
from hav.apps.sets.schema import Query as NodesQuery
from hav.apps.webassets.schema import Query as AssetsQuery


class Query(
    CollectionQuery,
    MediaQuery,
    NodesQuery,
    AssetsQuery,
    ArchivedFilesQuery,
    graphene.ObjectType,
):
    # This class will inherit from multiple Queries
    # as we begin to add more apps to our project
    pass


schema = graphene.Schema(query=Query)
