from rest_framework.views import APIView
from rest_framework.response import Response

from apps.media.models import MediaCreator, License
from ..permissions import IncomingBaseMixin


class PrepareIngestView(IncomingBaseMixin, APIView):

    def post(self, request):

        files = request.data.get('files', [])
        creators = [{'id': mc.pk, 'name': str(mc)} for mc in MediaCreator.objects.all()]
        licenses = [{'id': l.pk, 'name': str(l)} for l in License.objects.all()]
        return Response({
            'files': [{
                'ingest_id': f,
                'initial_data': {}
            } for f in files],
            'options': {
                'creators': creators,
                'licenses': licenses
            }
        })

