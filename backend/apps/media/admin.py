from django.contrib import admin
from .models import MediaCreatorRole, License, Media, MediaCreator, MediaType


class MediaAdmin(admin.ModelAdmin):
    list_display = [
        "pk",
        "title",
    ]
    list_filter = ["collection"]
    date_hierarchy = "created_at"


admin.site.register(MediaType)
admin.site.register(MediaCreator)
admin.site.register(MediaCreatorRole)
admin.site.register(License)
admin.site.register(Media, MediaAdmin)
