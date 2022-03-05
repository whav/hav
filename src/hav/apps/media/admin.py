from django.contrib import admin
from .models import MediaCreatorRole, License, Media, MediaCreator, MediaType


class MediaAdmin(admin.ModelAdmin):
    list_display = [
        "pk",
        "title",
        "original_media_identifier",
    ]
    list_filter = ["collection"]
    filter_horizontal = ["tags"]
    date_hierarchy = "created_at"
    exclude = ["files", "attachments"]
    search_fields = ["original_media_identifier"]


admin.site.register(MediaType)
admin.site.register(MediaCreator)
admin.site.register(MediaCreatorRole)
admin.site.register(License)
admin.site.register(Media, MediaAdmin)
