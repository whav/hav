from hav.apps.webassets.operations import create_webassets
from PIL import Image
from . import WebAssetTestCase


class VideoTestCase(WebAssetTestCase):
    def test_image_file_creation(self):
        afs = self.create_archive_file(self.testfiles["image"])
        # self.assertEqual(len(afs), ArchiveFile.objects.count())
        create_webassets(afs.pk)
        self.assertEqual(afs.webasset_set.count(), 1)
        image = afs.webasset_set.get(mime_type__startswith="image/")
        self.assertIsNotNone(image.width)
        self.assertIsNotNone(image.height)

        pil_img = Image.open(afs.file.path)
        self.assertEqual(
            image.height, pil_img.height, "Original dimensions of the source are kept."
        )
        self.assertEqual(
            image.width, pil_img.width, "Original dimensions of the source are kept."
        )
