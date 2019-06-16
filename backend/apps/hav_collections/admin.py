from django.contrib import admin
from .models import Collection


class CollectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'short_name', 'slug', 'media_count', 'public')

    def media_count(self, obj):
        return obj.media_set.count()


admin.site.register(Collection, CollectionAdmin)
