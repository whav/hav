from django.conf.urls import url, include
from incoming.api import UploadedFileCreateView, FolderAPIView, RootFolderAPIView

api_urls = [
    url(r'^upload/$', UploadedFileCreateView.as_view(), name='upload'),
    url(r'^incoming/$', RootFolderAPIView.as_view(), name='folder_root'),
    url(r'^incoming/(?P<pk>\d+)/$', FolderAPIView.as_view(), name='folder')
]
