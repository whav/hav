from django.urls import path, include

from views.public import LandingPage, CollectionRoot, FolderView, MediaView

urlpatterns = [
    path("", LandingPage.as_view(), name="landing_page"),
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
]
