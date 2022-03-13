from django.contrib import admin

from .models import Collection


class CollectionAdmin(admin.ModelAdmin):
    prepopulated_fields = {"short_name": ("slug",)}
    list_display = ("name", "short_name", "slug", "media_count", "public", "type")

    def media_count(self, obj):
        return obj.media_set.count()


admin.site.register(Collection, CollectionAdmin)
