from django.contrib import admin

from .models import IngestQueue


@admin.register(IngestQueue)
class IngestQAdmin(admin.ModelAdmin):
    list_display = ("uuid", "ingestion_queue_length", "created_at", "created_by")
    readonly_fields = (
        "created_by",
        "target",
    )
