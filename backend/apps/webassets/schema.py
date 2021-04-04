import graphene
from graphene_django.types import DjangoObjectType
from hav_utils.imaginary import generate_src_url
from .models import WebAsset
from django.templatetags.static import static

fallback_url = static("webassets/no_image_available.svg")


class WebAssetType(DjangoObjectType):

    url = graphene.String()

    def resolve_url(self, info):
        for m in self.archivefile.media_set.all():
            if not m.is_public:
                return info.context.build_absolute_uri(fallback_url)

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
