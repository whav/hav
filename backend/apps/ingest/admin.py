from django.contrib import admin
from .models import IngestQueue


class IngestQAdmin(admin.ModelAdmin):
    list_display = ('uuid', 'selection_length', 'created_at', 'created_by')
    readonly_fields = (
        'selection',
        'created_by',
        'expanded_selection',
        'data',
        'ingested',
        'target',
        'ready_for_ingestion'
    )
admin.site.register(IngestQueue, IngestQAdmin)