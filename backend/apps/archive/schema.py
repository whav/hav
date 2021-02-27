import graphene
from graphene_django.types import DjangoObjectType
from apps.webassets.schema import WebAssetType
from django.urls import reverse

from .models import ArchiveFile


class ArchiveFileType(DjangoObjectType):

    mime_type = graphene.String()
    webassets = graphene.List(lambda: WebAssetType)
    download_url = graphene.String()
    permalink = graphene.String()

    def resolve_mime_type(self, info):
        return self.mime_type

    def resolve_webassets(self, info):
        return self.webasset_set.all()

    def resolve_download_url(self, info):
        url = reverse("archive:download", kwargs={"pk": self.pk})
        return url

    def resolve_permalink(self, info):
        url = reverse("archive:file_by_hash", kwargs={"hash": self.hash})
        return info.context.build_absolute_uri(url)

    class Meta:
        model = ArchiveFile


class Query:
    archived_files = graphene.List(
        ArchiveFileType, mediaId=graphene.String(required=True)
    )

    def resolve_archived_files(self, info, **kwargs):
        media_id = kwargs.get("mediaId")
        return ArchiveFile.objects.filter(media=media_id)
