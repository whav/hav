from django.urls import path
from .views import redirect_to_archive

urlpatterns = [path("<str:media_id>/", redirect_to_archive)]
