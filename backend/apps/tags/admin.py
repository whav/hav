from django.contrib import admin
from .models import Tag


class TagAdmin(admin.ModelAdmin):
    list_display = ("name", "collection", "source")
    list_filter = ("collection", "source")


admin.site.register(Tag, TagAdmin)
