import os
from django.test import SimpleTestCase

from rest_framework.test import APISimpleTestCase
from rest_framework.permissions import AllowAny
from rest_framework.test import APIRequestFactory

from ..filebrowser import FileBrowser




class FileBrowserTest(APISimpleTestCase):

    def setUp(self):
        # this is the path to the test structure for the filebrowser
        self.root = os.path.join(os.path.dirname(__file__), 'filebrowser/')

        # disable all security measures and point the root to the test directory
        self.view = FileBrowser.as_view(
            root=self.root,
            permission_classes=[AllowAny,]
        )

        self.factory = APIRequestFactory()

    def getPath(self, path):
        return self.view(
            self.factory.get(
                '/',
                format='json'
            ),
            path=path
        )

    def testRootPath(self):
        '''
        Check if root attribute on view is correctly set.
        Not sure if this actually test anything besides the as_view method.
        '''
        self.assertEqual(self.view.view_initkwargs['root'], self.root)

    def testRoot(self):
        response = self.getPath('/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['name'], 'Root')
        self.assertEqual(
            response.data['files'][0]['name'],
            'README.txt',
            'first (and only returned file) is the README.txt'
        )
        self.assertEqual(
            len(response.data['files']),
            1
        )

    def testChildrenDirs(self):
        response = self.getPath('/')
        children = response.data['childrenDirs']
        self.assertEqual(len(children), 2)
        self.assertTrue(children[0]['name'] == 'a')


