from django.shortcuts import get_object_or_404
from django.http import HttpResponseRedirect
from django.urls import reverse
from .models import Media
from apps.media.hashid import decode


def redirect_to_archive(request, media_id):
    # For the record: I am not proud of this piece of code
    try:
        # try by id first
        media_id = int(media_id)
        media = Media.objects.get(pk=media_id)
    except (ValueError, Media.DoesNotExist):
        try:
            # next by shortcode
            media = Media.objects.get(short_code=media_id)
        except Media.DoesNotExist:
            # and finally try to decode a hashid
            try:
                media_id, *_ = decode(media_id)
            except ValueError:
                media_id = None

            media = get_object_or_404(Media, pk=media_id)

    archive_media_url = reverse("archive:media", kwargs={"pk": media.id})
    return HttpResponseRedirect(archive_media_url)
