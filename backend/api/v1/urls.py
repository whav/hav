from django.conf.urls import url
from .views import UploadedFileCreateView, FolderAPIView, RootFolderAPIView
from .filebrowser import FileBrowser

urlpatterns = [
    url(r'^upload/$', UploadedFileCreateView.as_view(), name='upload'),
    url(r'^incoming/$', RootFolderAPIView.as_view(), name='folder_root'),
    url(r'^incoming/(?P<pk>\d+)/$', FolderAPIView.as_view(), name='folder'),
    url(r'^fb/(?P<path>.*)?$', FileBrowser.as_view(), name='filebrowser'),
]
