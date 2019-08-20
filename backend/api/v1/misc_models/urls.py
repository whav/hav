from django.urls import path
from .views import MediaCreatorAPI

urlpatterns = [
    path('creators/', MediaCreatorAPI.as_view(), name='creators'),
]