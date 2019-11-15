import graphene

from graphene_django.types import DjangoObjectType

from .models import Tag, TagSource


class TagSourceType(DjangoObjectType):
    class Meta:
        model = TagSource


class TagType(DjangoObjectType):
    class Meta:
        model = Tag
        fields = ["id", "name", "source"]
