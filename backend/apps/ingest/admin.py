from django.contrib import admin
from .models import IngestQueue


class IngestQAdmin(admin.ModelAdmin):
    list_display = ('uuid', 'ingestion_queue_length', 'created_at', 'created_by')
    readonly_fields = (
        'created_by',
        'target',
    )
admin.site.register(IngestQueue, IngestQAdmin)