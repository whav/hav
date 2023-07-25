import uuid
from mimetypes import guess_type
from pathlib import Path

from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import models
from django.template.defaultfilters import filesizeformat
from django.utils.functional import cached_property

from hav.utils.fields import LanguageField

from ..accounts.models import User
from ..media.models import CreatorBase, License, MediaCreator
from .storage import ArchiveStorage


class FileCreator(CreatorBase):
    file = models.ForeignKey("ArchiveFile", on_delete=models.CASCADE)


class ArchiveFile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    file = models.FileField(
        storage=ArchiveStorage(), upload_to="%Y/%m/%d", editable=False, null=True
    )

    original_filename = models.CharField(max_length=200, editable=False, blank=True)
    source_id = models.CharField(max_length=400, blank=True)

    hash = models.CharField(
        max_length=40, unique=True, db_index=True, null=True, default=None
    )
    size = models.BigIntegerField(default=0)
    archived_at = models.DateTimeField(null=True)

    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_created=True, null=True)

    creators = models.ManyToManyField(
        MediaCreator, through=FileCreator, verbose_name="creators"
    )

    language = LanguageField(blank=True)

    license = models.ForeignKey(
        License, null=True, blank=True, on_delete=models.PROTECT
    )

    prohibit_download = models.BooleanField(default=False, blank=True)

    _webasset_hints = models.JSONField(default=dict, blank=True)

    def get_license(self):
        if self.license:
            return self.license
        else:
            try:
                return self.media_set.get().license
            except ObjectDoesNotExist:
                pass

    @cached_property
    def media(self):
        return self.media_set.get()

    @property
    def mime_type(self):
        return guess_type(self.original_filename)[0]

    def __str__(self):
        if self.file:
            return "{0} ({1})".format(self.file.path, filesizeformat(self.size))
        else:
            return "Unarchived File Instance: Source {0}".format(self.source_id)

    def resolve_source(self):
        from hav.views.api.v1.ingest.fields import resolveURLtoFilePath

        return Path(resolveURLtoFilePath(self.source_id))

    def validate_file_integrity(self):
        from .operations.hash import generate_hash

        if not self.hash:
            raise ValidationError(
                f"{self.__class__.name} with id {self.pk} does not have a stored hash."
            )
        path = self.file.path
        hash = generate_hash(path)
        if hash != self.hash:
            raise ValidationError("Calculated hash does not match stored hash.")
        return True

    def clean(self):
        from hav.apps.webassets.hints import validate_webasset_hints

        if self._webasset_hints:
            try:
                self._webasset_hints = validate_webasset_hints(
                    self.mime_type, self._webasset_hints
                )
            except ValidationError as e:
                raise ValidationError({"_webasset_hints": e})

    def has_download_permission(self, user):
        if self.prohibit_download:
            return False

        return self.media.is_public

    class Meta:
        ordering = ("archived_at",)


class AttachmentFile(ArchiveFile):
    class Meta:
        proxy = True
