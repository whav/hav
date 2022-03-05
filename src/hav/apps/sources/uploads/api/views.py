from pathlib import Path
from datetime import datetime, timedelta, timezone
from django.shortcuts import get_object_or_404


from rest_framework.views import APIView
from rest_framework.parsers import FileUploadParser
from rest_framework import serializers
from rest_framework.response import Response

from hav.utils.imaginary import generate_thumbnail_url, generate_srcset_urls
from ...permissions import IncomingBaseMixin

from hav.apps.sources.uploads.models import FileUpload
from hav.apps.sources.filesystem.api.serializers import (
    FileDetailSerializer as FSFileDetailSerializer,
)


class BaseFileSerializer(serializers.ModelSerializer):

    name = serializers.SerializerMethodField()

    url = serializers.SerializerMethodField()
    preview_url = serializers.SerializerMethodField()

    path = serializers.SerializerMethodField()

    @property
    def _config(self):
        return self.context["source_config"]

    @property
    def request(self):
        return self.context["request"]

    def get_full_name(self, upload):
        return upload.file.name

    def get_preview_url(self, upload):
        return generate_thumbnail_url(upload)

    def get_url(self, upload):
        rel_url = self._config.to_url(upload.pk, self.request)
        return self.request.build_absolute_uri(rel_url)

    def get_name(self, upload):
        return Path(upload.file.name).name

    def get_path(self, upload):
        return str(upload.pk)

    class Meta:
        model = FileUpload
        fields = (
            "created_at",
            "url",
            "path",
            "preview_url",
            "name",
        )


class FileDetailSerializer(FSFileDetailSerializer):
    @property
    def upload(self):
        return self.context["upload"]

    def get_srcset(self, p):
        return generate_srcset_urls(self.upload)

    def get_preview_url(self, p):
        return generate_thumbnail_url(self.upload)

    def get_url(self, path):
        return self.request.build_absolute_uri(
            self._config.to_url(self.upload.pk, self.request)
        )


class CreateFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileUpload
        fields = ("file",)


class FileUploadBaseView(IncomingBaseMixin, APIView):
    source_config = None

    @property
    def context(self):
        return {"request": self.request, "source_config": self.source_config}


class FileUploadView(FileUploadBaseView):
    def get(self, request):
        date_cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
        serializer = BaseFileSerializer(
            FileUpload.objects.filter(
                created_by=self.request.user, created_at__gt=date_cutoff
            ).order_by("-created_at"),
            many=True,
            context=self.context,
        )
        return Response(data=serializer.data)


class FileDetailView(FileUploadBaseView):
    parser_classes = [FileUploadParser]

    def get(self, request, pk):
        upload = get_object_or_404(FileUpload, pk=pk)
        context = self.context
        context.update({"upload": upload})
        serializer = FileDetailSerializer(
            instance=Path(self.source_config.root_path).joinpath(upload.file.name),
            context=context,
        )
        return Response(serializer.data)

    def put(self, request, **kwargs):
        serializer = CreateFileSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        fu = serializer.save(created_by=request.user)

        serializer = BaseFileSerializer(instance=fu, context=self.context)
        return Response(data=serializer.data, status=201)
