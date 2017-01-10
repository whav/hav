from django.conf.urls import url
from .views import UploadedFileCreateView, FolderAPIView, RootFolderAPIView

urlpatterns = [
    url(r'^upload/$', UploadedFileCreateView.as_view(), name='upload'),
    url(r'^incoming/$', RootFolderAPIView.as_view(), name='folder_root'),
    url(r'^incoming/(?P<pk>\d+)/$', FolderAPIView.as_view(), name='folder')
]
