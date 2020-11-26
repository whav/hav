from itertools import chain

import graphene
from django.db.models import Q
from graphene_django.types import DjangoObjectType
from django.utils.functional import cached_property
from apps.sets.models import Node
from apps.sets.schema import NodeType
from apps.tags.schema import TagType
from hav_utils.imaginary import (
    generate_thumbnail_url,
    generate_srcset_urls,
    generate_src_url,
)
from .models import Media, MediaCreator, License


class MediaType(DjangoObjectType):

    ancestors = graphene.List(NodeType)

    type = graphene.Field(graphene.String)

    creation_timeframe = graphene.List(graphene.DateTime)
    tags = graphene.List(TagType)

    thumbnail_url = graphene.Field(graphene.String)
    src = graphene.Field(graphene.String)
    srcset = graphene.List(graphene.String)
    height = graphene.Field(graphene.Int, required=False)
    width = graphene.Field(graphene.Int, required=False)

    def resolve_height(self, info):
        asset = self.primary_image_webasset
        if asset:
            return asset.height

    def resolve_width(self, info):
        asset = self.primary_image_webasset
        if asset:
            return asset.width

    def resolve_creation_timeframe(self, info):
        # print(self.creation_date)
        return [self.creation_date.lower, self.creation_date.upper]

    def resolve_src(self, info):
        asset = self.primary_image_webasset
        if asset:
            return generate_src_url(asset)
        return ""

    def resolve_srcset(self, info):
        asset = self.primary_image_webasset
        if asset:
            return [f"{src[1]} {src[0]}w" for src in generate_srcset_urls(asset)]
        return []

    def resolve_type(self, info):
        if self.primary_file:
            return self.primary_file.mime_type
        return None

    def resolve_tags(self, info):
        return self.tags.all()

    def resolve_thumbnail_url(self, info):
        asset = self.primary_image_webasset
        if asset:
            return generate_thumbnail_url(asset)
        return ""

    def resolve_ancestors(self, info):
        return chain(self.set.collection_ancestors, [self.set])

    @classmethod
    def get_queryset(cls, queryset, info):
        return queryset

    class Meta:
        model = Media
        exclude = ["creation_date"]


class CreatorType(DjangoObjectType):
    class Meta:
        model = MediaCreator


class LicenseType(DjangoObjectType):
    def resolve_logo(self, info):
        return info.context.build_absolute_uri(self.logo.url)

    class Meta:
        model = License


class Query:

    media = graphene.Field(MediaType, id=graphene.String(required=True))
    media_entries = graphene.List(MediaType, nodeID=graphene.String(required=True))

    def resolve_media(self, info, **kwargs):
        id = kwargs.get("id")
        return Media.objects.prefetch_related("files__webasset_set").get(
            Q(pk=id) | Q(original_media_identifier=id) | Q()
        )

    def resolve_media_entries(self, info, nodeID):
        node = Node.objects.get(pk=nodeID)
        return Media.objects.prefetch_related("files__webasset_set").filter(set=node)
