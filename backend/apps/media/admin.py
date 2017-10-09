from django.contrib import admin
from .models import MediaCreatorRole, License, Media, MediaCreator

admin.site.register(MediaCreatorRole)
admin.site.register(License)
admin.site.register(Media)
admin.site.register(MediaCreator)