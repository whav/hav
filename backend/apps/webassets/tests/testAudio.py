from django.test import TestCase


from apps.archive.models import ArchiveFile
from django.contrib.auth.models import User

from . import WebAssetTestCase


class AudioTestCase(WebAssetTestCase):

    def setUp(self):
        self.user = User.objects.get_or_create(username='testuser')[0]

    def test_audio_file_creation(self):
        afs = self.create_archive_file(self.testfiles['audio'])
        # self.assertEqual(len(afs), ArchiveFile.objects.count())