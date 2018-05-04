from django.db import models
from django.template.defaultfilters import filesizeformat
from .storage import ArchiveStorage

from django.conf import settings

import uuid


class ArchiveFile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(storage=ArchiveStorage(), upload_to='%Y/%m/%d', editable=False)

    original_filename = models.CharField(max_length=200, editable=False, blank=True)
    source_id = models.CharField(max_length=200, blank=True)

    hash = models.CharField(max_length=40, unique=True, db_index=True)
    size = models.IntegerField()

    archived_at = models.DateTimeField(auto_now_add=True)
    archived_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)

    def __str__(self):
        return '{0} ({1})'.format(self.file.path, filesizeformat(self.file.size))
