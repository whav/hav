from pathlib import Path
from datetime import datetime, timedelta

from rest_framework.views import APIView
from rest_framework.parsers import FileUploadParser
from rest_framework import serializers
from rest_framework.response import Response

from ...permissions import IncomingBaseMixin
from sources.uploads.models import FileUpload


class BaseFileSerializer(serializers.ModelSerializer):

    url = serializers.SerializerMethodField()

    def get_url(self, upload):
        return upload.file.url

    class Meta:
        model = FileUpload
        fields = ('created_at', 'url')


class CreateFileSerializer(serializers.ModelSerializer):

    class Meta:
        model =FileUpload
        fields = ('file',)


class FileUploadView(IncomingBaseMixin, APIView):

    source_config = None
    parser_classes = [FileUploadParser]

    @property
    def root(self):
        return self.source_config.root_path

    def get(self, request):
        date_cutoff = datetime.now() - timedelta(hours=24)
        serializer = BaseFileSerializer(
            FileUpload.objects.filter(created_by=self.request.user, created_at__gt=date_cutoff).order_by('-created_at'),
            many=True
        )
        return Response(data=serializer.data)

    def put(self, request, path=None, filename=None, **kwargs):
        serializer = CreateFileSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        fu = serializer.save(created_by=request.user)

        serializer = BaseFileSerializer(
            instance=fu,
            context={
                "request": request
            }
        )
        return Response(data=serializer.data, status=201)
