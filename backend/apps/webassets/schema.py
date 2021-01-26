import graphene
from graphene_django.types import DjangoObjectType
from hav_utils.imaginary import generate_src_url

from .models import WebAsset


class WebAssetType(DjangoObjectType):

    url = graphene.String()

    def resolve_url(self, info):
        if self.mime_type.startswith("image/"):
            return generate_src_url(self)
        return self.file.url

    class Meta:
        model = WebAsset



class Query:

    webassets = graphene.List(WebAssetType, mediaId=graphene.String(required=True))


    def resolve_webassets(self, info, **kwargs):
        media_id = kwargs.get("mediaId")
        return WebAsset.objects.filter(archivefile__media=media_id)
