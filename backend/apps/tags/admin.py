from django.contrib import admin
from .models import CollectionTag, ManagedTag

admin.site.register(CollectionTag)


class ManagedTagAdmin(admin.ModelAdmin):
    list_display = ('name', 'source', 'source_ref')
    list_filter = ('source',)


admin.site.register(ManagedTag, ManagedTagAdmin)
