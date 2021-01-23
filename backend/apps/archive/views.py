from django.views.generic import DetailView
from .models import ArchiveFile
from django.http.response import HttpResponse
import mimetypes
from pathlib import Path

class ArchiveFileDownloadView(DetailView):

    model = ArchiveFile

    def get(self, request, *args, **kwargs):
        archive_file = self.get_object()
        filename = archive_file.file.name
        url = f'/archive/{filename}'
        # url = request.build_absolute_uri(url)
        response =  HttpResponse()
        response['X-Accel-Redirect'] = url
        response['Content-Type'] = mimetypes.guess_type(filename)[0]
        response['Content-Disposition'] = Path(filename).name
        return response
