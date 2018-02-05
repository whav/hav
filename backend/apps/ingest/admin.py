from django.contrib import admin
from .models import IngestQueue


class IngestQAdmin(admin.ModelAdmin):
    list_display = ('uuid', 'selection_length', 'created_at', 'created_by')
    readonly_fields = (
        'created_by',
        'ingestion_items',
        'target',
    )
admin.site.register(IngestQueue, IngestQAdmin)