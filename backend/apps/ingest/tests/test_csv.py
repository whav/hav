from io import StringIO
from uuid import uuid4
import os
import shutil
from rest_framework.authtoken.models import Token
from django.test import TransactionTestCase, override_settings
from django.core.management import call_command, CommandError
from django.contrib.auth.models import User
from django.conf import settings

from apps.hav_collections.models import Collection
from apps.sets.models import Node
from apps.media.models import Media

tmpdir_root = '/tmp/testfiles'
tmpdirs = {'HAV_ARCHIVE_PATH': 'archive',
           'WEBASSET_ROOT': 'webassets'
           }

test_root = os.path.dirname(__file__)


"""
Planed to user override_settings in order not to polute the filesystem when
running tests outside the build. Not working as it does not reach the other
containers.
@override_settings(HAV_ARCHIVE_PATH=os.path.join(tmpdir_root,
                                                 tmpdirs['HAV_ARCHIVE_PATH']),
                   WEBASSET_ROOT=os.path.join(tmpdir_root,
                                              tmpdirs['WEBASSET_ROOT']),
                   INCOMING_FILES_ROOT=os.path.join(test_root),
                   )
"""


class TestCSVImport(TransactionTestCase):
    fixtures = ['ingest-test-fixtures_media']

    csv_file = os.path.join(test_root, "./meta.csv")

    def setUp(self):
        for _, directory in tmpdirs.items():
            targetdir = os.path.join(tmpdir_root, directory)
            if not os.path.isdir(targetdir):
                print(f"Creating {targetdir}")
                os.makedirs(targetdir)

    def tearDown(self):
        print(f"deleting {tmpdir_root}")
        shutil.rmtree(tmpdir_root)

    def run_command(self, *args, **kwargs):
        output = StringIO()
        call_command("csv_import", *args, stdout=output)
        return output.getvalue()

    def testCommandErrors(self):
        with self.assertRaises(CommandError):
            self.run_command()
            self.run_command(self.csv_file)

    @override_settings(HAV_ARCHIVE_PATH=os.path.join(tmpdir_root,
                                                     tmpdirs['HAV_ARCHIVE_PATH']),
                       WEBASSET_ROOT=os.path.join(tmpdir_root,
                                                  tmpdirs['WEBASSET_ROOT']),
                       )
    def testCommandSuccess(self):
        # Overriding INCOMING_FILES_ROOT does not work in our setup (for some
        # reason paths are still encoded based on what is INCOMING_FILES_ROOT
        # provided in the project settings. For now just symlinking the
        # testfile-dir into INCOMING_FILES_ROOT and unlinking it afterwards
        try:
            os.symlink(os.path.join(test_root, 'test__files__only'),
                       os.path.join(settings.INCOMING_FILES_ROOT, 'test__files__only'))
        except FileExistsError:
            pass
        self.user = User.objects.create_superuser('batch_import_user',
                                                  'batch@import.user', uuid4)
        self.usertoken = Token.objects.create(user=self.user).key
        self.root_node = Node.add_root(name="test")
        self.collection = Collection.objects.create(
            name="test", short_name="test", root_node=self.root_node
        )
        self.collection.administrators.set([self.user])

        # The actual Test
        with self.settings(DRF_AUTH_TOKEN=self.usertoken):
            self.run_command(self.csv_file, self.root_node.pk, self.user.username)
        self.assertEqual(Media.objects.all().count(), 4)

        # unlink testfile-dir from INCOMING_FILES_ROOT
        os.unlink(os.path.join(settings.INCOMING_FILES_ROOT, 'test__files__only'))
