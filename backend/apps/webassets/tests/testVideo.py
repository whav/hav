from ..operations import create_webassets

from . import WebAssetTestCase


class VideoTestCase(WebAssetTestCase):

    def test_video_file_creation(self):
        afs = self.create_archive_file(self.testfiles['video'])
        # self.assertEqual(len(afs), ArchiveFile.objects.count())
        create_webassets(afs.pk)
        self.assertEqual(afs.webasset_set.count(), 2)
        image = afs.webasset_set.get(mime_type__startswith='image/')
        audio = afs.webasset_set.get(mime_type__startswith='video/')
        print(image, audio)