from django.contrib import admin
from .models import Collection


class CollectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'short_name', 'slug', 'public')


admin.site.register(Collection, CollectionAdmin)
