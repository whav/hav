import os

from rest_framework.test import APISimpleTestCase

from .. import FSSource


class FileBrowserTest(APISimpleTestCase):
    def setUp(self):
        # this is the path to the test structure for the filebrowser
        self.root = os.path.join(os.path.dirname(__file__), "filebrowser/")

        # disable all security measures and point the root to the test directory
        self.source = FSSource(self.root, "test_fs_source")

    def testFBUrls(self):
        self.assertTrue(len(self.source.urls) > 0)
