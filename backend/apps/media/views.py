from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.http import HttpResponseRedirect
from django.urls import reverse
from .models import Media


def redirect_to_archive(request, media_id):
    media = get_object_or_404(Media, short_code=media_id)
    archive_media_url = reverse("archive:media", kwargs={"pk": media.id})
    return HttpResponseRedirect(archive_media_url)
