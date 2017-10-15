from rest_framework.test import APITestCase, APISimpleTestCase
from rest_framework import status
from django.urls import reverse
from uuid import uuid4
from datetime import date
from apps.sets.models import Node
from apps.media.models import License, MediaCreator
from django.contrib.auth.models import User

# from ..serializers import MediaCreatorSerializer
#
# class MediaSerializerTest(APISimpleTestCase):
#
#     def test_serializer(self):


class BatchTest(APITestCase):

    def setUp(self):
        self.root = Node.add_root(name='testroot')
        self.target = self.root.add_child(name='testchild')
        self.url = reverse('api:v1:ingest')
        self.user = User.objects.create_superuser('tester', 'test@example.com', uuid4())
        self.creator = MediaCreator.objects.create(first_name='Tester', last_name='Testeroo')
        self.license = License.objects.create(short_name='WTFPL')

    def generateMediaData(self, count=1):
        today = date.today()
        entries = []
        for i in range(count):
            entries.append({
                'year': today.year,
                'month': today.month,
                'day': today.day,
                'creators': [self.creator.pk],
                'license': self.license.pk,
                'ingestion_id': __file__
            })
        return entries

    def test_create_permissions(self):
        data = {
            'target': self.target.pk,
            'entries': []
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.force_login(self.user)
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create(self):
        data = {
            'target': self.target.pk,
            'entries': self.generateMediaData(count=5)
        }
        self.client.force_login(self.user)
        response = self.client.post(self.url, data, format='json')
        print(response.status_code, response.data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)




