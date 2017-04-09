from django.conf.urls import url
from .views import debugView

urlpatterns = [
    url(r'^(?P<path>.*/)?', debugView)
]
