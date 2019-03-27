from django.db import models
from django.template.defaultfilters import filesizeformat
from django.core.exceptions import ValidationError

from .storage import ArchiveStorage
from mimetypes import guess_type
from django.conf import settings
import uuid


class ArchiveFile(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(storage=ArchiveStorage(), upload_to='%Y/%m/%d', editable=False)

    original_filename = models.CharField(max_length=200, editable=False, blank=True)
    source_id = models.CharField(max_length=200, blank=True)

    hash = models.CharField(max_length=40, unique=True, db_index=True)
    size = models.BigIntegerField()

    archived_at = models.DateTimeField(auto_now_add=True)
    archived_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)

    @property
    def mime_type(self):
        return guess_type(self.original_filename)[0]

    def __str__(self):
        return '{0} ({1})'.format(self.file.path, filesizeformat(self.size))


    def validate_file_integrity(self):
        from .operations.hash import generate_hash

        if not self.hash:
            raise ValidationError(f"{self.__class__.name} with id {self.pk} does not have a stored hash.")
        path = self.file.path
        hash = generate_hash(path)
        if hash != self.hash:
            raise ValidationError("Calculated hash does not match stored hash.")
        return True


class AttachmentFile(ArchiveFile):

    class Meta:
        proxy = True
