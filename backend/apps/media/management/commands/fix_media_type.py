from django.core.management.base import BaseCommand
from apps.media.models import Media, MediaType


class Command(BaseCommand):
    help = "Fix media entries that have their type set to null"

    def handle(self, *args, **options):
        media = Media.objects.filter(type=None).iterator()
        for m in media:
            print(media.archivefile_set.all())
