from django.urls import path, include

from views.public import LandingPage, CollectionRoot, FolderView, MediaView
from views.public.flatpages import FlatpageView
from django.views.generic import TemplateView

urlpatterns = [
    path("", FlatpageView.as_view(slug="index"), name="landing_page"),
    path(
        "collections/<slug:collection_slug>/",
        include(
            [
                path("", CollectionRoot.as_view(), name="collection_root"),
                path("node/<int:node_pk>/", FolderView.as_view(), name="folder_view"),
                path("media/<int:media_pk>/", MediaView.as_view(), name="media_view"),
            ]
        ),
    ),
    # flatpages...
    path("<slug:slug>/", FlatpageView.as_view(), name="flatpage"),
]
