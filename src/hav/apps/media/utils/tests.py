from datetime import timedelta

from django.utils import timezone

from hav.apps.accounts.models import User
from hav.apps.media.models import License, Media, MediaCreator, MediaType
from hav.apps.sets.models import Node


def generate_test_media():
    creator, _ = MediaCreator.objects.get_or_create(
        first_name="Tester", last_name="Testeroo"
    )
    user, _ = User.objects.get_or_create(username="tester", email="tester@example.com")
    license, _ = License.objects.get_or_create(short_name="WTFPL")
    media_type, _ = MediaType.objects.get_or_create(type=1, name="testtype")
    node = Node.add_root(name="TestingCollection")

    return Media.objects.create_media(
        created_by=user,
        license=license,
        creation_date=(
            timezone.now() - timedelta(days=3),
            timezone.now() - timedelta(hours=2),
        ),
        set=node,
        creators=[creator],
        original_media_type=media_type,
    )
