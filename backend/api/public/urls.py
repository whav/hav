from django.urls import re_path, path
from .views import CollectionListView
from apps.search.views import SearchView

app_name = "api"

urlpatterns = [
    path("collections/", CollectionListView.as_view()),
    path("search/", SearchView.as_view()),
]
