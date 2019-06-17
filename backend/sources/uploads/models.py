from django.db import models
from django.conf import settings


class FileUpload(models.Model):

    file = models.FileField(upload_to='%Y/%m/%d/')

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='uploaded_files')
    created_at = models.DateTimeField(auto_now_add=True)
