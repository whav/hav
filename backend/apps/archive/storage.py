import os
import uuid

from django.core.files.storage import FileSystemStorage

from django.conf import settings

class ArchiveStorage(FileSystemStorage):

    def __init__(self, **kwargs):
        kwargs.update({'location': settings.HAV_ARCHIVE_PATH})
        super().__init__(**kwargs)

    def generate_filename(self, filename):
        return super().generate_filename(filename)