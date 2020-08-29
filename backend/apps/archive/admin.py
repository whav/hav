from django.contrib import admin
from .models import ArchiveFile, AttachmentFile

admin.site.register(ArchiveFile)
admin.site.register(AttachmentFile)
