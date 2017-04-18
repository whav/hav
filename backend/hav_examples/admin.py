from django.contrib import admin
from .models import Media, FileAttachment

class AttachmentInlineAdmin(admin.TabularInline):
    model = FileAttachment

@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    inlines = [
        AttachmentInlineAdmin
    ]

