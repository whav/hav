import graphene

from graphene_django.types import DjangoObjectType

from .models import Media, MediaCreator, License
from apps.sets.schema import SetType


class MediaType(DjangoObjectType):

    ancestors = graphene.List(SetType)

    def resolve_ancestors(self, info):
        root = self.set.get_collection()
        if self.set == root:
            return []

        return self.set.get_ancestors()

    class Meta:
        model = Media

class CreatorType(DjangoObjectType):
    class Meta:
        model = MediaCreator

class LicenseType(DjangoObjectType):
    class Meta:
        model = License

class Query(object):

    media = graphene.Field(MediaType, id=graphene.String(), name=graphene.String())

    def resolve_media(self, info, **kwargs):
        print(info)
        id = kwargs.get('id')
        return Media.objects.get(pk=id)

