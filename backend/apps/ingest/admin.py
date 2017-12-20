from django.contrib import admin
from .models import IngestQueue


class IngestQAdmin(admin.ModelAdmin):
    list_display = ('uuid', 'selection_length', 'created_at', 'created_by')

admin.site.register(IngestQueue, IngestQAdmin)