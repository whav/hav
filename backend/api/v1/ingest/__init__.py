from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveAPIView
from rest_framework.response import Response

from apps.media.models import MediaCreator, MediaCreatorRole, License
from apps.ingest.models import IngestQueue
from ..permissions import IncomingBaseMixin
from .serializers import MediaCreatorRoleSerializer, MediaLicenseSerializer, BatchMediaSerializer, \
    PrepareIngestSerializer, IngestionItemSerializer, IngestQueueSerializer, SimpleIngestQueueSerializer
from .resolver import resolveIngestionItems


class PrepareIngestView(IncomingBaseMixin, APIView):

    def post(self, request):

        serializer_context = {
            'request': request,
            'user': request.user
        }
        serializer = PrepareIngestSerializer(data=request.data, context=serializer_context)

        if not serializer.is_valid():
            return Response(serializer.errors, status=404)

        data = serializer.validated_data
        ingestion_items = resolveIngestionItems(data['items'])

        ingestion_serializers = map(
            lambda i: IngestionItemSerializer(instance={'path': i[0], 'item': i[1]}, context=serializer_context),
            ingestion_items
        )
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
            'items': ingestion_data,
            'options': {
                'creators': creators,
                'roles': roles,
                'licenses': licenses,
            }
        })


class IngestOptionsView(IncomingBaseMixin, APIView):
    def get(self, request):
        return Response({
            "creators": [{'id': mc.pk, 'name': str(mc)} for mc in MediaCreator.objects.all()],
            "roles": MediaCreatorRoleSerializer(MediaCreatorRole.objects.all(), many=True).data,
            "licenses": MediaLicenseSerializer(License.objects.all(), many=True).data
        })

class IngestQueueView(IncomingBaseMixin, ListCreateAPIView):

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return IngestQueueSerializer
        return SimpleIngestQueueSerializer

    def get_queryset(self):
        return IngestQueue.objects.filter(created_by=self.request.user).order_by('-created_at')

# class IngestView(IncomingBaseMixin, APIView):
#
#     def post(self, request):
#         serializer = BatchMediaSerializer(data=request.data, context={'user': request.user, 'request': request})
#         serializer.is_valid(raise_exception=True)
#         media_entries = serializer.save()
#         return Response(media_entries, status=status.HTTP_201_CREATED)


class IngestQueueDetailView(IncomingBaseMixin, RetrieveAPIView):

    serializer_class = IngestQueueSerializer
    lookup_field = 'uuid'
    lookup_url_kwarg = 'pk'

    def get_queryset(self):
        return IngestQueue.objects.filter(created_by=self.request.user)






