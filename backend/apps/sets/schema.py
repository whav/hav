import graphene

from graphene_django.types import DjangoObjectType

from .models import Node

class SetType(DjangoObjectType):
    class Meta:
        model = Node



