import os

from rest_framework.test import APISimpleTestCase
from rest_framework.permissions import AllowAny
from rest_framework.test import APIRequestFactory

from ..fsBrowser.views import FileBrowser


class FileBrowserTest(APISimpleTestCase):

    def setUp(self):
        # this is the path to the test structure for the filebrowser
        self.root = os.path.join(os.path.dirname(__file__), 'filebrowser/')

        # disable all security measures and point the root to the test directory
        self.view = FileBrowser.as_view(
            root=self.root,
            permission_classes=[AllowAny,]
        )

    # def testMetadataAccess(self):


