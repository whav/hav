from django.urls import path
from .views import CollectionListView, NodeView, MediaView
from apps.search.views import SearchView

app_name = "api"

urlpatterns = [
    path("collections/", CollectionListView.as_view(), name="collection_list"),
    path("node/<int:node_id>/", NodeView.as_view(), name="node_detail"),
    path("media/<int:media_id>/", MediaView.as_view(), name="media_detail"),
    path("search/", SearchView.as_view()),
]
