from django.urls import include, path

from .views import (
    ArchiveFileByHashView,
    ArchiveFileByIDView,
    ArchiveFileDownloadView,
    ArchiveMediaView,
    ArchiveNodeView,
)

urlpatterns = [
    path("download/<pk>/", ArchiveFileDownloadView.as_view(), name="download"),
    path("file/hash/<hash>/", ArchiveFileByHashView.as_view(), name="file_by_hash"),
    path("file/<pk>/", ArchiveFileByIDView.as_view(), name="file_by_id"),
    path("media/<pk>/", ArchiveMediaView.as_view(), name="media"),
    path("node/<pk>/", ArchiveNodeView.as_view(), name="node"),
]
