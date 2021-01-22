from django.views.generic import DetailView
from .models import ArchiveFile
from django.http.response import HttpResponse

class ArchiveFileDownloadView(DetailView):

    model = ArchiveFile

    def get(self, request, *args, **kwargs):
        archive_file = self.get_object()
        url = f'/archive/{archive_file.file.name}'
        # url = request.build_absolute_uri(url)
        response =  HttpResponse()
        response['X-Accel-Redirect'] = url
        response['Content-Type'] = ''
        return response
