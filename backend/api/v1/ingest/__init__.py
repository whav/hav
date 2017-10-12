from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import date
from apps.media.models import MediaCreator, MediaCreatorRole, License
from ..permissions import IncomingBaseMixin
from .serializers import MediaCreatorRoleSerializer



class PrepareIngestView(IncomingBaseMixin, APIView):

    def post(self, request):

        files = request.data.get('files', [])
        creators = [{'id': mc.pk, 'name': str(mc)} for mc in MediaCreator.objects.all()]
        roles = MediaCreatorRoleSerializer(MediaCreatorRole.objects.all(), many=True).data
        licenses = [{'id': l.pk, 'name': str(l)} for l in License.objects.all()]
        today = date.today()
        return Response({
            'files': [{
                'ingest_id': f,
                'initial_data': {
                    'year': today.year,
                    'month': today.month,
                    'day': today.day
                }
            } for f in files],
            'options': {
                'creators': creators,
                'roles': roles,
                'licenses': licenses,
            }
        })

