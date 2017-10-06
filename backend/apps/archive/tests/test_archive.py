from django.test import TestCase
from django.contrib.auth.models import User
import os

from ..operations import archive_file
from .test_hash import file_hash, file_path

class ArchiveTest(TestCase):

    test_file = file_path

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.user = User.objects.create_user(
            'testuser',
            'tester@example.com',
            'urxn'
        )
        cls.af = archive_file(cls.test_file, user=cls.user)


    def test_archive_attributes(self):
        self.assertEqual(self.af.hash, file_hash)
        self.assertEqual(self.af.original_filename, 'file.bin')
        self.assertEqual(self.af.size, 1024)


    def test_archive_filename(self):
        self.assertTrue(self.af.file.path.endswith('.bin'))
        self.assertEqual(
            os.path.split(self.af.file.name)[1],
            str(self.af.id) + '.bin'
        )