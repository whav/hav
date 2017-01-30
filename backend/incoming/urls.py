from django.conf.urls import url, include
from .views import debug

urlpatterns = [
    url(r'^$', debug)
]
