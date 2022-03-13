from django.db import models

from ...accounts.models import User


class FileUpload(models.Model):

    file = models.FileField(upload_to="%Y/%m/%d/")

    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="uploaded_files",
    )
    created_at = models.DateTimeField(auto_now_add=True)
