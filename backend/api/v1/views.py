from urllib.parse import urlparse
from django.urls import resolve

from rest_framework.views import APIView
from rest_framework.response import Response
from .permissions import IncomingBaseMixin


class PrepareIngestView(IncomingBaseMixin, APIView):

    def post(self, request):
        from hav.celery import debug_task
        debug_task.delay(request.data)
        print(request.data)
        return Response(request.data)

