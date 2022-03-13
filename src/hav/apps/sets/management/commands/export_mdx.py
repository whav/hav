import pathlib

from django.core.management.base import BaseCommand, CommandError
from django.db import models
from django.db.models.functions import Length

from ...models import Node


def export_descriptions(output_dir: pathlib.Path, nodes):

    created_files = []
    for node in nodes:
        output_file = output_dir / f"{node.pk}.mdx"
        with output_file.open("w") as mdx:
            mdx.write(node.description)

        created_files.append(output_file.resolve().as_posix())
    return created_files


class Command(BaseCommand):
    help = "Export all node descriptions (with content) to a directory"

    def add_arguments(self, parser):
        parser.add_argument("destination_dir", type=pathlib.Path)

    def handle(self, *args, **options):
        destination_path = options.get("destination_dir").resolve()
        assert destination_path.exists() and destination_path.is_dir()
        nodes = Node.objects.annotate(description_length=Length("description")).filter(
            description_length__gt=0
        )
        mdx_file_paths = export_descriptions(destination_path, nodes)
        # raise NotImplementedError()
        self.stdout.write(f"Created {len(mdx_file_paths)} mdx files.")
