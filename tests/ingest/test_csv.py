from io import StringIO
from uuid import uuid4

import tempfile
from unittest import skip
from pathlib import Path
from rest_framework.authtoken.models import Token
from django.test import TransactionTestCase, override_settings
from django.core.management import call_command, CommandError
from hav.apps.accounts.models import User
from django.conf import settings

from hav.apps.hav_collections.models import Collection
from hav.apps.sets.models import Node
from hav.apps.media.models import Media

tmpdirs = {
    "archive": tempfile.TemporaryDirectory(),
    "webassets": tempfile.TemporaryDirectory(),
    "incoming": tempfile.TemporaryDirectory(),
    "logs": tempfile.TemporaryDirectory(),
}

# skip for now
# the main problem seems to be that INGESTION_SOURCES settings are
# actually ignored and the api urls build their own source instances
@skip
@override_settings(
    HAV_ARCHIVE_PATH=tmpdirs["archive"].name,
    WEBASSET_ROOT=tmpdirs["webassets"].name,
    INCOMING_FILES_ROOT=tmpdirs["incoming"].name,
    INGEST_LOG_DIR=tmpdirs["logs"].name,
)
class TestCSVImport(TransactionTestCase):
    fixtures = ["ingest-test-fixtures_media"]

    csv_file = Path(__file__).parent / "./meta.csv"

    def setUp(self) -> None:
        self.user = User.objects.create_superuser(
            "batch_import_user", "batch@import.user", uuid4
        )
        self.root_node = Node.add_root(name="test")
        self.collection = Collection.objects.create(
            name="test", short_name="test", root_node=self.root_node
        )
        self.collection.administrators.set([self.user])

    def run_command(self, *args, **kwargs):
        output = StringIO()
        call_command("csv_import", *args, stdout=output)
        return output.getvalue()

    def testCommandErrors(self):
        with self.assertRaises(CommandError):
            self.run_command()
            self.run_command(self.csv_file)

    def testOverrides(self):
        assert settings.INCOMING_FILES_ROOT == tmpdirs["incoming"].name
        assert settings.HAV_ARCHIVE_PATH == tmpdirs["archive"].name
        assert settings.WEBASSET_ROOT == tmpdirs["webassets"].name
        assert settings.INGEST_LOG_DIR == tmpdirs["logs"].name

    def testCommandSuccess(self):

        self.usertoken = Token.objects.create(user=self.user).key

        # The actual Test
        with self.settings(DRF_AUTH_TOKEN=self.usertoken):
            self.run_command(self.csv_file, self.root_node.pk, self.user.username)

        self.assertEqual(Media.objects.all().count(), 4)
