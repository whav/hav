from django.core.management.base import BaseCommand, CommandError
from ...models import ArchiveFile
from apps.tags.models import Tag
import mimetypes
import copy
import re
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Interpret technical tags and set the right hints for webasset generation."

    def add_arguments(self, parser):
        # Named (optional) arguments
        parser.add_argument(
            "--dry-run",
            action="store_true",
            default=False,
            help="Only display which files would be affected.",
        )

    def rotation_tags(self, dry_run):
        rotate_regex = r"^rotate:(\d+)"
        rotation_tags = Tag.objects.filter(name__regex=rotate_regex)
        rotations = {}
        for tag in rotation_tags:
            rotations[tag.pk] = {
                "rotation": int(re.match(rotate_regex, tag.name).group(1))
            }

        for tag_id, hints in rotations.items():
            archived_files = ArchiveFile.objects.filter(media__tags__pk=tag_id)
            for af in archived_files:
                # make sure we only operate on images
                mtype, _ = mimetypes.guess_type(af.file.name)
                assert mtype.startswith("image/")

                # update the hints
                existing_hints = copy.deepcopy(af._webasset_hints)
                existing_hints.update(hints)
                if af._webasset_hints == existing_hints:
                    logger.info(
                        f"Skipping file {af.pk} because it already has the right hints."
                    )
                    continue
                else:
                    logger.info(f"Updating hints for file {af}")
                    af._webasset_hints = existing_hints
                    af.full_clean(exclude=["created_at"])
                    if not dry_run:
                        af.save()

    def handle(self, *args, **options):
        dry_run = options.get("dry_run")
        self.rotation_tags(dry_run=dry_run)
