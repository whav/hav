from django.contrib.auth.models import AbstractUser
from apps.media.models import Media

class User(AbstractUser):
    class Meta:
        db_table = "auth_user"

    def can_view_media(self, media: Media):
        from .permissions import can_view_media
        return can_view_media(self, media)
