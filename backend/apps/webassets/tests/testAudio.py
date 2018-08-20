from django.test import TestCase
from pathlib import Path
from shutil import copyfile

from apps.archive.models import ArchiveFile

from django.contrib.auth.models import User

testdata_dir = Path(__file__).parent.joinpath('./testdata/')

testfiles = {
    'audio': testdata_dir.joinpath('sound.mp3'),
    'video': testdata_dir.joinpath('video.webm'),
    'image': testdata_dir.joinpath('image.jpg')
}


class WebAssetTestCase(TestCase):

    def setUp(self):
        self.user = User.objects.get_or_create(username='testuser')[0]

    def create_archive_file(self, file):
        file = Path(file).resolve()
        af = ArchiveFile(
            archived_by=self.user,
            size=file.stat().st_size
        )
        af.file = af.file.storage.get_available_name(file.name)
        copyfile(file, af.file.path)
        af.save()
        return af

    def test_archive_file_creation(self):
        afs = [self.create_archive_file(f) for f in testfiles.values()]
        self.assertEqual(len(afs), ArchiveFile.objects.count())