from django.urls import path

from views.public import LandingPage

urlpatterns = [
    path("", LandingPage.as_view(), name="landing_page"),
]
