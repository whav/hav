from django.conf.urls import url
from django.conf import settings
from .views import UploadedFileCreateView, FolderAPIView, RootFolderAPIView
from .filebrowser import FileBrowser, FileBrowserFile

r'^(?P<path>.*/)?(?P<filename>(?:$|(.+?)(?:(\.[^.]*$)|$)))'

urlpatterns = [
    url(r'^upload/$', UploadedFileCreateView.as_view(), name='upload'),
    url(r'^incoming/$', RootFolderAPIView.as_view(), name='folder_root'),
    url(r'^incoming/(?P<pk>\d+)/$', FolderAPIView.as_view(), name='folder'),
    url(
        r'^fb/(?P<path>.*/)?$',
        FileBrowser.as_view(root=settings.MEDIA_ROOT), name='filebrowser'
    ),
    url(r'^fb/(?P<path>.*/)?(?P<filename>(?:$|(.+?)(?:(\.[^.]*$)|$)))',
        FileBrowserFile.as_view(root=settings.MEDIA_ROOT),
        name='filebrowser_file'
    ),

]
