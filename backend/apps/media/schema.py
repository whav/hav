from itertools import chain
from datetime import datetime, date
import graphene
from django.db.models import Q, F
from graphene_django.types import DjangoObjectType

from apps.sets.models import Node, group_media_queryset
from apps.sets.schema import NodeType
from apps.tags.schema import TagType
from hav_utils.imaginary import (
    generate_thumbnail_url,
    generate_srcset_urls,
    generate_src_url,
)
from hav_utils.daterange import Resolutions, calculate_date_resolution, format_datetime
from .models import Media, MediaCreator, License, MediaType as DBMediaType
from django.templatetags.static import static

fallback_url = static("webassets/no_image_available.svg")


class MediaType(DjangoObjectType):

    ancestors = graphene.List(NodeType)

    type = graphene.Field(graphene.String)

    creation_timeframe = graphene.List(graphene.DateTime)
    creation_timeframe_resolution = graphene.Field(graphene.String, required=False)

    locked = graphene.Field(graphene.Boolean)

    tags = graphene.List(TagType)

    src = graphene.Field(graphene.String)
    srcset = graphene.List(graphene.String)

    thumbnail_url = graphene.Field(graphene.String)
    height = graphene.Field(graphene.Int, required=False)
    width = graphene.Field(graphene.Int, required=False)
    aspect_ratio = graphene.Field(graphene.Float, required=False)

    grouper = graphene.Field(graphene.String, required=False)

    def resolve_locked(self, _):
        return not self.is_public

    def resolve_height(self, _):
        asset = self.primary_image_webasset
        if asset:
            return asset.height

    def resolve_width(self, _):
        asset = self.primary_image_webasset
        if asset:
            return asset.width

    def resolve_aspect_ratio(self, _):
        asset = self.primary_image_webasset
        if asset and asset.width and asset.height:
            return asset.width / asset.height

    def resolve_creation_timeframe(self, _):
        return [self.creation_date.lower, self.creation_date.upper]

    def resolve_creation_timeframe_resolution(self, _):
        resolution = calculate_date_resolution(
            self.creation_date.lower, self.creation_date.upper
        )
        if resolution:
            return Resolutions(resolution).name

    def resolve_type(self, info):
        if self.primary_file:
            mime = self.primary_file.mime_type
            if mime:
                return mime.split("/")[0]
        return None

    def resolve_tags(self, info):
        return self.tags.all()

    # TODO: clean up the is_private / is_public handling in these methods
    def resolve_thumbnail_url(self, info):
        if not self.is_public:
            return fallback_url

        asset = self.primary_image_webasset
        if asset:
            return generate_thumbnail_url(
                asset,
                width=300,
                height=None,
                operation="thumbnail",
                user=info.context.user,
            )
        return fallback_url

    def resolve_src(self, _):
        if self.is_public:
            asset = self.primary_image_webasset
            if asset:
                return generate_src_url(asset)
        return fallback_url

    def resolve_srcset(self, _):
        if self.is_public:
            asset = self.primary_image_webasset
            if asset:
                return [f"{src[1]} {src[0]}w" for src in generate_srcset_urls(asset)]
        return []

    def resolve_ancestors(self, info):
        return chain(self.set.collection_ancestors, [self.set])

    def resolve_grouper(self, info):
        grouper = getattr(self, "grouper", "")
        if isinstance(grouper, (datetime, date)):
            return format_datetime(grouper)
        return grouper

    @classmethod
    def get_queryset(cls, queryset, info):
        return queryset

    class Meta:
        model = Media
        exclude = ["creation_date"]


class OriginalMediaType(DjangoObjectType):
    def resolve_name(self, info):
        return str(self)

    class Meta:
        model = DBMediaType
        fields = ["name"]


class CreatorType(DjangoObjectType):
    class Meta:
        model = MediaCreator


class LicenseType(DjangoObjectType):
    def resolve_logo(self, info):
        if self.logo:
            return info.context.build_absolute_uri(self.logo.url)
        return ""

    class Meta:
        model = License


class Query:

    media = graphene.Field(MediaType, id=graphene.String(required=True))
    media_entries = graphene.List(MediaType, node_id=graphene.String(required=True))

    def resolve_media(self, info, **kwargs):
        id = kwargs.get("id")
        return Media.objects.prefetch_related("files__webasset_set").get(
            Q(pk=id) | Q(original_media_identifier=id) | Q()
        )

    def resolve_media_entries(self, info, node_id):
        node = Node.objects.get(pk=node_id)
        qs = Media.objects.prefetch_related("files__webasset_set").filter(set=node)

        return group_media_queryset(qs, node.display_type)
