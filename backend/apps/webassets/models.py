import os
import mimetypes
from PIL import Image
from django.db import models

from apps.archive.models import ArchiveFile
from hav_utils.storages import getStorage

storage = getStorage('webassets')


def upload_to(webasset, original_filename):
    ext = os.path.splitext(original_filename)[1]
    af = webasset.archivefile
    path = os.path.splitext(af.file.name)[0]
    return storage.get_available_name('%s%s' % (path, ext))


class WebAsset(models.Model):

    archivefile = models.ForeignKey(ArchiveFile, on_delete=models.CASCADE)

    file = models.FileField(storage=storage, upload_to=upload_to)
    mime_type = models.CharField(max_length=20)

    # these fields are used for images
    width = models.PositiveIntegerField(null=True, blank=True)
    height = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self):
        return '%s %s' % (self.file.name, self.mime_type)

    def is_image(self):
        return self.mime_type.startswith('image')

    def get_available_file_name(self, extension):
        if not extension.startswith('.'):
            extension = '.%s' % extension
        return os.path.join(
            storage.location,
            upload_to(self, 'file%s' % extension)
        )

    def save(self, *args, **kwargs):
        if not self.mime_type and self.file:
            self.mime_type = mimetypes.guess_type(self.file.name)[0]

        if self.is_image():
            img = Image.open(self.file.path)
            self.width, self.height = img.size

        return super().save(*args, **kwargs)