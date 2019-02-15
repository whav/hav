from datetime import datetime, timedelta
from uuid import uuid4
import os
import random
from django.contrib.auth.models import User
from django.conf import settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
import random
from apps.media.models import License, MediaCreator, media_types
from apps.sets.models import Node
from apps.ingest.models import IngestQueue
from apps.hav_collections.models import Collection
from hav_utils.generate_image import generate_image


def create_image(target):
    from PIL import ImageDraw
    img = generate_image(os.path.basename(target))

    def point():
        return random.randint(1, img.width), random.randint(1, img.height)

    points = [point() for _ in range(random.randint(3, 10))]

    draw = ImageDraw.Draw(img)
    draw.polygon(points)  # outline='red', fill='blue'
    img.save(target)


class IngestTest(APITestCase):

    def setUp(self):
        self.root = Node.add_root(name='testroot')
        self.target = self.root.add_child(name='testchild')
        self.user = User.objects.create_superuser('tester', 'test@example.com', uuid4())
        self.creator = MediaCreator.objects.create(first_name='Tester', last_name='Testeroo')
        self.license = License.objects.create(short_name='WTFPL')

        self.collection = Collection.objects.create(
            name='Testcollection',
            root_node=self.target,
        )
        self.collection.administrators.set([self.user])
        self.source_id = self.generate_source_id()
        self.queue = IngestQueue.objects.create(target=self.target, created_by=self.user, ingestion_queue=[self.source_id])
        self.url = reverse('api:v1:ingest:ingest_queue_ingest', kwargs={'pk': str(self.queue.pk)})


    def generate_source_id(self):
        filename = '{}.jpg'.format(uuid4())
        target = os.path.join(settings.INCOMING_FILES_ROOT, filename)
        create_image(target)

        # get the source id from the api
        api_url = reverse('api:v1:filebrowser_root')
        self.client.force_login(self.user)
        resp = self.client.get(api_url, format='json')

        files = resp.data['files']
        uploaded_file = list(filter(lambda f: f['name'] == filename, files))[0]
        # log the client out again, to test permissions from a clean sheet
        self.client.logout()
        return uploaded_file['url']


    def generateMediaData(self):
        start = datetime.utcnow()
        end = start + timedelta(days=1)

        return {
                'start': start.isoformat(),
                'end': end.isoformat(),
                'creators': [self.creator.pk],
                'media_license': self.license.pk,
                'media_type': media_types[0][0],
                'source': self.source_id,
                'media_title': 'some title'
        }


    def test_create_permissions(self):
        data = self.generateMediaData()
        response = self.client.post(self.url, data, format='json')
        print(response.content)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.force_login(self.user)
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create(self):
        data = self.generateMediaData()
        self.client.force_login(self.user)
        response = self.client.post(self.url, data, format='json')
        print(response.content)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)




