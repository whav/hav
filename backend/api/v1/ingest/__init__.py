from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from datetime import date
from apps.media.models import MediaCreator, MediaCreatorRole, License

from ..permissions import IncomingBaseMixin
from .serializers import MediaCreatorRoleSerializer, MediaLicenseSerializer, BatchMediaSerializer, PrepareIngestSerializer, IngestionItemSerializer

from .resolver import resolveIngestionItems


class PrepareIngestView(IncomingBaseMixin, APIView):

    def post(self, request):
        serializer = PrepareIngestSerializer(data=request.data)

        if serializer.is_valid():
            data = serializer.validated_data
            ingestion_items = resolveIngestionItems(data['items'])
            ingestion_serializers = map(lambda i: IngestionItemSerializer(instance={'path': i[0], 'item': i[1]}), ingestion_items)
            ingestion_data = map(lambda i: i.data, ingestion_serializers)


        # collect all options
        creators = [{'id': mc.pk, 'name': str(mc)} for mc in MediaCreator.objects.all()]
        roles = MediaCreatorRoleSerializer(MediaCreatorRole.objects.all(), many=True).data
        licenses = MediaLicenseSerializer(License.objects.all(), many=True).data

        return Response({
            'files': [{
                'ingest_id': f,
                'initial_data': {
                    'license': 1,
                    'year': 2007,
                    'creators': [1]
                }
            } for f in []],
            'items': map(lambda i: i.data, ingestion_serializers),
            'options': {
                'creators': creators,
                'roles': roles,
                'licenses': licenses,
            }
        })


class IngestView(IncomingBaseMixin, APIView):

    def post(self, request):
        serializer = BatchMediaSerializer(data=request.data, context={'user': request.user, 'request': request})
        serializer.is_valid(raise_exception=True)
        media_entries = serializer.save()
        return Response(media_entries, status=status.HTTP_201_CREATED)





