from django.contrib import admin
from .models import FileIngestSelection

class FileIngestSelectionAdmin(admin.ModelAdmin):

    def file_count(self, obj):
        return len(obj.source_references)

    list_display = ('modified', 'created', 'created_by', 'file_count')
    ordering = ('-modified',)

admin.site.register(FileIngestSelection, FileIngestSelectionAdmin)