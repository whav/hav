import mimetypes
from pathlib import Path

from django.http.response import HttpResponse, HttpResponseForbidden
from django.urls import reverse
from django.views.generic import DetailView

from hav.apps.media.models import Media
from hav.apps.sets.models import Node

from .models import ArchiveFile


class ArchiveFileBaseView(DetailView):
    template_name = "archive/file.html"
    queryset = ArchiveFile.objects.all()

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        media = self.object.media_set.get()
        ctx.update({"media": media, "collection": media.collection})
        return ctx


class ArchiveFileByHashView(ArchiveFileBaseView):
    def get_object(self, queryset=None):
        hash = self.kwargs["hash"]
        queryset = queryset or ArchiveFile.objects.all()
        return queryset.get(hash=hash)


class ArchiveFileByIDView(ArchiveFileBaseView):
    pass


class ArchiveNodeView(DetailView):
    model = Node
    template_name = "archive/redirect.html"


class ArchiveMediaView(DetailView):
    model = Media
    template_name = "archive/redirect.html"


class ArchiveFileDownloadView(DetailView):

    model = ArchiveFile

    def get(self, request, *args, **kwargs):
        archive_file: ArchiveFile = self.get_object()

        if not archive_file.has_download_permission(request.user):
            return HttpResponseForbidden(
                """
                Downloading of this archived file has been blocked by the administrators.
                Please contact the collection administrator for more information on this issue.
            """
            )

        filename = archive_file.file.name
        # url = f'/protected/download/{filename}'
        url = reverse("protected_download", kwargs={"path": filename})
        # url = request.build_absolute_uri(url)
        response = HttpResponse()
        response["X-Accel-Redirect"] = url
        response["Content-Type"] = mimetypes.guess_type(filename)[0] or ""
        response[
            "Content-Disposition"
        ] = f'attachment; filename="{Path(archive_file.original_filename or filename).name}"'
        return response
