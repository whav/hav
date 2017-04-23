from uuid import uuid4
from django.db import models
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.contrib.postgres.fields import ArrayField, JSONField
from model_utils.models import TimeStampedModel

from treebeard.mp_tree import MP_Node

from .validators import validate_list_of_lists


class FileIngestSelection(TimeStampedModel):

    description = models.CharField(max_length=100, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        editable=False,
        null=True,
        on_delete=models.SET_NULL
    )

    source_references = JSONField(
        default=list,
        validators=[validate_list_of_lists]
    )
