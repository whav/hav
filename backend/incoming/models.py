from django.db import models
from django.conf import settings

from model_utils.models import TimeStampedModel

from treebeard.mp_tree import MP_Node

# get the upload folder for incoming files
try:
    upload_folder = settings.HAV_UPLOAD_FOLDER
except AttributeError:
    upload_folder = settings.MEDIA_ROOT


class UploadedFile(TimeStampedModel):

    uploader = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        editable=False,
        on_delete=models.CASCADE
    )

    file = models.FileField(
        upload_to=upload_folder,
        verbose_name='uploaded file',
    )

    folder = models.ForeignKey(
        'UploadedFileFolder',
        null=True,
        blank=False,
        on_delete=models.CASCADE
    )


class UploadedFileFolder(TimeStampedModel, MP_Node):
    node_order_by = ['name']
    name = models.CharField(max_length=255, blank=True)
    description = models.TextField(max_length=1000, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        editable=False,
        null=True,
        on_delete=models.SET_NULL
    )
