from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    class Meta:
        db_table = "auth_user"

    def can_view_media(self, media):
        from .permissions import can_view_media

        return can_view_media(self, media)
