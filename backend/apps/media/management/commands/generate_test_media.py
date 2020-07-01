from django.core.management.base import BaseCommand
from apps.media.models import Media, License, MediaCreator, MediaType
from apps.hav_collections.models import Collection
from django.contrib.auth.models import User
from django.utils import timezone

import random


users = list(User.objects.all())
licenses = list(License.objects.all())
creators = MediaCreator.objects.all()
media_types = MediaType.objects.all()


class Command(BaseCommand):
    help = 'Generates images and adds them to collections'

    def add_arguments(self, parser):
        parser.add_argument('media_count', type=int)

    def handle(self, *args, **options):
        count = options['media_count']
        for collection in Collection.objects.filter(root_node__isnull=False):
            root_node = collection.root_node
            self.stdout.write(
                self.style.SUCCESS(
                    f'{Collection} MediaCount: {Media.objects.filter(collection=collection).count()}'
                )
            )
            for i in range(count):
                Media.objects.create_media(
                    creators=random.choices(creators, k=1),
                    license=random.choice(licenses),
                    original_media_type=random.choice(media_types),
                    creation_date=(
                        timezone.now(),
                        None
                    ),
                    set=root_node,
                    collection=collection,
                    created_by=random.choice(users)
                )
