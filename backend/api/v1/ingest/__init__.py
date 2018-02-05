from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveAPIView, CreateAPIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from apps.media.models import MediaCreator, MediaCreatorRole, License, Media
from apps.ingest.models import IngestQueue
from ..permissions import IncomingBaseMixin
from .serializers import MediaCreatorRoleSerializer, MediaLicenseSerializer, \
    PrepareIngestSerializer, IngestionItemSerializer, IngestQueueSerializer, \
    SimpleIngestQueueSerializer, IngestSerializer, SimpleMediaSerializer

from .resolver import resolveIngestionItems


class IngestOptionsView(IncomingBaseMixin, APIView):
    def get(self, request):
        return Response({
            "creators": [{'id': mc.pk, 'name': str(mc)} for mc in MediaCreator.objects.all()],
            "roles": MediaCreatorRoleSerializer(MediaCreatorRole.objects.all(), many=True).data,
            "licenses": MediaLicenseSerializer(License.objects.all(), many=True).data,
            "media_types": Media.MEDIA_TYPE_CHOICES
        })


class IngestQueueView(IncomingBaseMixin, ListCreateAPIView):

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return IngestQueueSerializer
        return SimpleIngestQueueSerializer

    def get_queryset(self):
        return IngestQueue.objects.filter(created_by=self.request.user).order_by('-created_at')


class IngestQueueDetailView(IncomingBaseMixin, RetrieveAPIView):

    serializer_class = IngestQueueSerializer
    lookup_field = 'uuid'
    lookup_url_kwarg = 'pk'

    def get_queryset(self):
        return IngestQueue.objects.filter(created_by=self.request.user, target__isnull=False)


class IngestQueueIngestionView(IncomingBaseMixin, APIView):

    def post(self, request, pk):
        queue = get_object_or_404(IngestQueue, pk=pk, created_by=request.user, target__isnull=False)
        context = {
            'user': request.user,
            'target': queue.target
        }
        serializer = IngestSerializer(
            data=request.data,
            context=context
        )
        serializer.is_valid(raise_exception=True)

        media = serializer.save()

        # update the ingest queue
        qref = IngestQueue.objects.select_for_update().get(pk=queue.pk)
        qref.ingestion_items.update({
            serializer.initial_data['source']: media.pk
        })
        qref.save()
        return Response(data=SimpleMediaSerializer(instance=media).data, status=201)








