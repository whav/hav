import graphene
from graphene_django.types import DjangoObjectType
from django.urls import reverse
from hav_utils.imaginary import generate_src_url, generate_thumbnail_url

from .models import WebAsset, ArchiveFile


class WebAssetType(DjangoObjectType):

    url = graphene.String()

    def resolve_url(self, info):
        if self.mime_type.startswith("image/"):
            return generate_src_url(self)
        return self.file.url

    class Meta:
        model = WebAsset


class ArchiveFileType(DjangoObjectType):

    mime_type = graphene.String()
    webassets = graphene.List(WebAssetType)
    download_url = graphene.String()

    def resolve_mime_type(self, info):
        return self.mime_type

    def resolve_webassets(self, info):
        return self.webasset_set.all()

    def resolve_download_url(self, info):
        url = reverse('archive:download', kwargs={'pk': self.pk})
        return url

    class Meta:
        model = ArchiveFile


class Query:
    archived_files = graphene.List(
        ArchiveFileType, mediaId=graphene.String(required=True)
    )
    webassets = graphene.List(WebAssetType, mediaId=graphene.String(required=True))

    def resolve_archived_files(self, info, **kwargs):
        media_id = kwargs.get("mediaId")
        return ArchiveFile.objects.filter(media=media_id)

    def resolve_webassets(self, info, **kwargs):
        media_id = kwargs.get("mediaId")
        return WebAsset.objects.filter(archivefile__media=media_id)
