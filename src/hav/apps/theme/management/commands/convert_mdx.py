"""Preview (or apply) the MDX to Markdown conversion of node descriptions."""

import difflib

from django.core.management.base import BaseCommand

from hav.apps.media.models import Media
from hav.apps.sets.models import Node
from hav.apps.theme.mdx import convert, is_changed


def _media_folder(media_id):
    return Media.objects.filter(pk=media_id).values_list("set_id", flat=True).first()


def _node_name(node_id):
    return Node.objects.filter(pk=node_id).values_list("name", flat=True).first()


class Command(BaseCommand):
    help = "Convert MDX node descriptions to Markdown (dry run unless --apply)."

    def add_arguments(self, parser):
        parser.add_argument("--apply", action="store_true", help="save the changes")

    def handle(self, *args, apply=False, **options):
        changed = 0
        for node in Node.objects.exclude(description="").order_by("pk"):
            converted, warnings = convert(node.description, _media_folder, _node_name)
            if not is_changed(node.description, converted) and not warnings:
                continue
            changed += 1
            self.stdout.write(
                self.style.MIGRATE_HEADING(f"node {node.pk}: {node.name}")
            )
            diff = difflib.unified_diff(
                node.description.splitlines(), converted.splitlines(), lineterm="", n=1
            )
            self.stdout.write("\n".join(list(diff)[2:]))
            for warning in warnings:
                self.stdout.write(self.style.WARNING(f"  {warning}"))
            if apply:
                node.description = converted
                node.save(update_fields=["description"])

        action = "Converted" if apply else "Would convert (use --apply)"
        self.stdout.write(f"{action}: {changed} descriptions.")
