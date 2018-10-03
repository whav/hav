from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveAPIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from apps.media.models import MediaCreator, MediaCreatorRole, License, Media
from apps.ingest.models import IngestQueue
from ..permissions import IncomingBaseMixin
from .serializers import MediaCreatorRoleSerializer, MediaLicenseSerializer, \
    PrepareIngestSerializer, IngestionItemSerializer, IngestQueueSerializer, \
    SimpleIngestQueueSerializer, IngestSerializer, SimpleMediaSerializer


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


class IngestQMixin(object):
    def get_queue(self):
        return get_object_or_404(
            IngestQueue,
            pk=self.kwargs.get('pk'),
            created_by=self.request.user,
            target__isnull=False
        )


class IngestQueueIngestionView(IncomingBaseMixin, IngestQMixin, APIView):

    def post(self, request, pk):
        queue = self.get_queue()
        context = {
            'request': request,
            'user': request.user,
            'queue': queue,
            'target': queue.target,
        }
        serializer = IngestSerializer(
            data=request.data,
            context=context
        )
        serializer.is_valid(raise_exception=True)

        media = serializer.save()

        return Response(data=SimpleMediaSerializer(instance=media, context=context).data, status=201)


class IngestQueueModifier(IncomingBaseMixin, IngestQMixin, APIView):

    def delete(self, request, pk):
        queue = self.get_queue()
        for item in request.data.get('items', []):
            try:
                queue.delete_item(item)
            except KeyError:
                continue

        queue.save()
        return Response(data=IngestQueueSerializer(
            instance=queue,
            context={
                'request': request
            }).data)






