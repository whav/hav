from django.views.generic import DetailView
from .models import ArchiveFile
from django.http.response import HttpResponse, Http404
import mimetypes
from pathlib import Path

class ArchiveFileBaseView(DetailView):
    template_name = 'archive/file.html'
    queryset = ArchiveFile.objects.all()

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx.update({
            'media': self.object.media_set.get()
        })
        return ctx


class ArchiveFileByHashView(ArchiveFileBaseView):

    def get_object(self, queryset=None):
        hash = self.kwargs['hash']
        queryset = queryset or ArchiveFile.objects.all()
        return queryset.get(hash=hash)

class ArchiveFileByIDView(ArchiveFileBaseView):
    pass


class ArchiveFileDownloadView(DetailView):

    model = ArchiveFile

    def get(self, request, *args, **kwargs):
        archive_file = self.get_object()
        filename = archive_file.file.name
        url = f'/archive/{filename}'
        # url = request.build_absolute_uri(url)
        response =  HttpResponse()
        response['X-Accel-Redirect'] = url
        response['Content-Type'] = mimetypes.guess_type(filename)[0] or ''
        response['Content-Disposition'] = f'attachment; filename="{Path(archive_file.original_filename or filename).name}"'
        return response




