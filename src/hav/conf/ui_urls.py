from django.urls import include, path

from hav.views.crud.folder import FolderUpdateView
from hav.views.public import CollectionRoot, FolderView, MediaView, SearchView
from hav.views.public.flatpages import FlatpageView

urlpatterns = [
    path("", FlatpageView.as_view(slug="index"), name="landing_page"),
    path(
        "collections/<slug:collection_slug>/",
        include(
            [
                path("", CollectionRoot.as_view(), name="collection_root"),
                # path("node/<int:node_pk>/", FolderView.as_view(), name="folder_view"),
                path(
                    "node/<int:node_pk>/",
                    include(
                        [
                            path("", FolderView.as_view(), name="folder_view"),
                            path(
                                "edit/", FolderUpdateView.as_view(), name="folder_edit"
                            ),
                        ]
                    ),
                ),
                path("media/<int:media_pk>/", MediaView.as_view(), name="media_view"),
                path("search/", SearchView.as_view(), name="collection_search"),
            ]
        ),
    ),
    # flatpages...
    path("<slug:slug>/", FlatpageView.as_view(), name="flatpage"),
]
