import os
from unittest.mock import patch

from django.test import TestCase

from hav.apps.accounts.models import User
from hav.apps.archive.models import ArchiveFile, AttachmentFile
from hav.apps.archive.operations import archive_file
from hav.apps.media import models, utils

from .test_hash import file_hash, file_path

attachment_hash = "4a4093cd339c3f4b2bd6229041140fe8ad496613"


class ArchiveTest(TestCase):

    test_file = file_path
    attachment_file = os.path.join(os.path.dirname(__file__), "attachment.bin")

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.user = User.objects.create_user("testuser", "tester@example.com", "urxn")
        cls.media = utils.generate_test_media()

        # we need to patch the resolver function as we are not
        with patch.object(ArchiveFile, "resolve_source", return_value=cls.test_file):
            cls.af = ArchiveFile.objects.create(
                source_id=str(cls.test_file), created_by=cls.user
            )
            archive_file(cls.af.pk)

        with patch.object(
            ArchiveFile, "resolve_source", return_value=cls.attachment_file
        ):
            cls.attachment = AttachmentFile.objects.create(
                source_id=str(cls.attachment_file), created_by=cls.user
            )
            archive_file(cls.attachment.pk, is_attachment=True)

        cls.media.files.set([cls.af])
        cls.media.attachments.set([cls.attachment])

        cls.attachment.refresh_from_db()
        cls.af.refresh_from_db()

    def test_archive_attributes(self):
        self.assertEqual(self.af.hash, file_hash)
        self.assertEqual(self.af.original_filename, "file.bin")
        self.assertEqual(self.af.size, 1024)
        self.assertIsNotNone(self.af.archived_at)

        self.assertEqual(self.attachment.hash, attachment_hash)
        self.assertEqual(self.attachment.original_filename, "attachment.bin")
        self.assertEqual(self.attachment.size, 1024)
        self.assertIsNotNone(self.attachment.archived_at)

    def test_media_linking(self):
        self.assertIsInstance(self.media, models.Media)
        self.assertEqual(self.media.files.count(), 1)
        self.assertEqual(self.media.files.all()[0].pk, self.af.pk)

    def test_media_attachments(self):
        self.assertEqual(self.media.attachments.count(), 1)
        self.assertEqual(self.media.attachments.all()[0].pk, self.attachment.pk)

    def test_archive_filename(self):
        self.assertTrue(self.af.file.path.endswith(".bin"))
        self.assertEqual(os.path.split(self.af.file.name)[1], str(self.af.id) + ".bin")
