from rest_framework.views import APIView
from rest_framework.response import Response
from .permissions import IncomingBaseMixin


class PrepareIngestView(IncomingBaseMixin, APIView):

    def post(self, request):
        from hav.celery import debug_task
        debug_task.delay(request.data)
        return Response(request.data)

