from pathlib import Path
import argparse
import csv
from mimetypes import guess_type
from django.core.management.base import BaseCommand, CommandError

from apps.sets.models import Node


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("csv_file", type=argparse.FileType("r"))
        parser.add_argument("set_id", type=int)
        parser.add_argument(
            "--dry-run", nargs="?", dest="dry_run", const=True, default=False
        )

    def handle(self, *args, **options):
        csv_file = options["csv_file"]
        target_node = Node.objects.get(pk=options["set_id"])

        root_path = Path(csv_file.name).resolve().parent

        csv_reader = csv.DictReader(csv_file)
        files = []
        mime_types = set()
        for line_number, line in enumerate(csv_reader):
            rel_file_path = line["SourceFile"]
            absolute_file_path = root_path.joinpath(rel_file_path).resolve()
            if not absolute_file_path.exists():
                raise CommandError(
                    f"Referenced file {absolute_file_path} (line: {line_number}) does not exist."
                )
            files.append(absolute_file_path)
            mime_types.add(guess_type(absolute_file_path.name)[0])

        print(
            f'Found {len(files)} files with {len(mime_types)} unique mime types ({", ".join(mime_types)}).'
        )
