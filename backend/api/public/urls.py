from django.urls import re_path, path
from .views import CollectionListView, NodeView, NodeWidgetView
from apps.search.views import SearchView

app_name = "api"

urlpatterns = [
    path("collections/", CollectionListView.as_view(), name="collection_list"),
    path("node/<int:node_id>/", NodeView.as_view(), name="node_detail"),
    path("search/", SearchView.as_view()),
    path("ui/node/<int:node_id>/", NodeWidgetView.as_view()),
    # path("ui/media/<int:media_id>/", MediaWidgetView.as_view())
]
