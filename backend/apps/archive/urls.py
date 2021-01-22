from django.urls import include, path
from .views import ArchiveFileDownloadView

urlpatterns = [
    path('download/<pk>/', ArchiveFileDownloadView.as_view(), name='download')
]
