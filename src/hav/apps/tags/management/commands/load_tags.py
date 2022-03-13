from importlib import import_module

from django.core.management.base import CommandError, LabelCommand

from ...models import ManagedTag
from ...sources import TAG_LABEL_TO_SOURCE


class Command(LabelCommand):

    help = "loads tags into the database"

    def handle_label(self, label, **options):
        try:
            source = TAG_LABEL_TO_SOURCE[label]
        except KeyError:
            raise CommandError(f"Label {label} is not configured")

        created_count = 0
        for key, name in source.get_all():
            tag, created = ManagedTag.objects.update_or_create(
                source=label, source_ref=key, defaults={"name": name}
            )
            if created:
                created_count += 1
