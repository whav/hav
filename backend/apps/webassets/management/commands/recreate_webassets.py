from django.core.management.base import BaseCommand, CommandError
from django.db.models import Q
from django.template.defaultfilters import filesizeformat
from apps.media.models import Media
from apps.hav_collections.models import Collection
from apps.archive.models import ArchiveFile
from ...operations  import create_webassets
from ...models import WebAsset

class Command(BaseCommand):
    help = 'Forces the recreation of webassets.'

    def add_arguments(self, parser):
        # Named (optional) arguments
        parser.add_argument(
            '--dry-run',
            action='store_true',
            default=False,
            help='Only display which files would be affected.',
        )
        parser.add_argument(
            '--media',
            type=int,
            default=[],
            action='append',
            help='Limit to media with given pk'
        )

        parser.add_argument(
            '--collection',
            type=str,
            default=[],
            action='append',
            help='Limit to media in specific collection'
        )

        parser.add_argument(
            '--extension',
            type=str,
            action='append',
            default=[],
            help='Filter by file extension (archived file)'
        )

    def get_queryset(self, media_ids, collection_slugs, extensions):
        # start by filtering media
        media = Media.objects.all()
        if len(media_ids):
            media = Media.objects.filter(pk__in=media_ids)

        if len(collection_slugs):
            collections = Collection.objects.filter(slug__in=collection_slugs)
            media = media.filter(collection__in=collections)

        # now move down to the archived files
        archived_files = ArchiveFile.objects.filter(media__in=media).prefetch_related('media_set', 'media_set__collection').order_by('media__set__id')

        if len(extensions):
            q = Q()
            for ext in extensions:
                q |= Q(original_filename__iendswith=ext) | Q(file__endswith=ext)
            archived_files = archived_files.filter(q)

        return archived_files


    def process_file(self, archived_file):
        # TODO: actually implement this stuff
        previously_generated_webassets = list(archived_file.webasset_set.values_list('pk', flat=True))
        create_webassets(archived_file.pk)
        # TODO: remove the webasset files?
        WebAsset.objects.filter(pk__in=previously_generated_webassets).delete()
        pass

    def handle(self, *args, **options):
        # gather all options to limit the resulting queryset
        media_ids = options.get('media', [])
        collection_slugs = options.get('collection', [])
        extensions=options.get('extension', [])
        archived_files = self.get_queryset(media_ids, collection_slugs, extensions)
        af_count = archived_files.count()

        self.stdout.write(f'Operating {af_count} files.')

        dry_run = options.get('dry_run')

        for af in archived_files:
            self.stdout.write(f'Processing file {af.file} (original name: {af.original_filename}, media: {af.media_set.get().id}, size: {filesizeformat(af.size)}, collection: {af.media_set.get().collection.slug})')
            if not dry_run:
                self.process_file(af)

        self.stdout.write(f'Processed {af_count} files.')
