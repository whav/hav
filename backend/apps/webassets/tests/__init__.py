from django.test import TestCase
from pathlib import Path
from shutil import copyfile

from apps.archive.models import ArchiveFile
from apps.archive.operations.hash import generate_hash

from django.contrib.auth.models import User

testdata_dir = Path(__file__).parent.joinpath("./testdata/")


class WebAssetTestCase(TestCase):

    testfiles = {
        "audio": testdata_dir.joinpath("sound.mp3"),
        "video": testdata_dir.joinpath("video.webm"),
        "image": testdata_dir.joinpath("image.jpg"),
    }

    def setUp(self):
        self.user = User.objects.get_or_create(username="testuser")[0]

    def create_archive_file(self, file):
        file = Path(file).resolve()
        af = ArchiveFile(
            created_by=self.user, size=file.stat().st_size, hash=generate_hash(file)
        )
        af.file = af.file.storage.get_available_name(file.name)
        copyfile(file, af.file.path)
        af.save()
        return af
