import os

from django.test import TestCase
from django.contrib.auth.models import User

from apps.archive.operations import archive_file
from .test_hash import file_hash, file_path

from apps.media import utils, models
from apps.archive.models import ArchiveFile

attachment_hash = '4a4093cd339c3f4b2bd6229041140fe8ad496613'

class ArchiveTest(TestCase):

    test_file = file_path
    attachment_file = os.path.join(os.path.dirname(__file__), 'attachment.bin')

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.user = User.objects.create_user(
            'testuser',
            'tester@example.com',
            'urxn'
        )
        cls.media = utils.generate_test_media()
        cls.af_pk = archive_file(cls.test_file, cls.media.pk, cls.user.pk)
        cls.af = ArchiveFile.objects.get(pk=cls.af_pk)

        cls.attachment_pk = archive_file(cls.attachment_file, cls.media.pk, cls.user.pk, is_attachment=True)
        cls.attachment = ArchiveFile.objects.get(pk=cls.attachment_pk)


    def test_archive_attributes(self):
        self.assertEqual(self.af.hash, file_hash)
        self.assertEqual(self.af.original_filename, 'file.bin')
        self.assertEqual(self.af.size, 1024)

        self.assertEqual(self.attachment.hash, attachment_hash)
        self.assertEqual(self.attachment.original_filename, 'attachment.bin')
        self.assertEqual(self.attachment.size, 1024)


    def test_media_linking(self):
        self.assertIsInstance(self.media, models.Media)
        self.assertEqual(self.media.files.count(), 1)
        self.assertEqual(self.media.files.all()[0].pk, self.af.pk)

    def test_media_attachments(self):
        self.assertEqual(self.media.attachments.count(), 1)
        self.assertEqual(self.media.attachments.all()[0].pk, self.attachment.pk)

    def test_archive_filename(self):
        self.assertTrue(self.af.file.path.endswith('.bin'))
        self.assertEqual(
            os.path.split(self.af.file.name)[1],
            str(self.af.id) + '.bin'
        )