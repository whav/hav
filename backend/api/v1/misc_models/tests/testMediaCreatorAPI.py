from uuid import uuid4
from django.contrib.auth.models import User
from datetime import datetime
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from apps.media.models import MediaCreator


class MediaCreatorAPITest(APITestCase):

    data = {
        "first_name": "Test",
        "last_name": "Creator",
        "display_name": "Testytesttest",
        "email": "foo@foo.bar",
    }

    def setUp(self):
        self.user = User.objects.create_superuser("tester", "test@example.com", uuid4())
        self.url = reverse("api:v1:models:creators")

    def test_permissions(self):
        response = self.client.post(self.url, self.data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create(self):
        self.client.force_login(self.user)
        response = self.client.post(self.url, self.data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        pk = response.data["id"]
        mc = MediaCreator.objects.get(pk=pk)
        self.assertEqual(mc.created_by, self.user)
        self.assertEqual(mc.last_name, self.data["last_name"])
        self.assertEqual(mc.first_name, self.data["first_name"])
        self.assertEqual(mc.display_name, self.data["display_name"])
        self.assertEqual(
            mc.name, self.data["last_name"] + ", " + self.data["first_name"]
        )
        self.assertEqual(mc.email, self.data["email"])
        self.assertIsInstance(mc.created, datetime)

    def test_create_last_name_only(self):
        self.client.force_login(self.user)
        data = dict(self.data)
        data.pop("first_name")
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        pk = response.data["id"]
        mc = MediaCreator.objects.get(pk=pk)
        self.assertEqual(mc.created_by, self.user)
        self.assertEqual(mc.last_name, self.data["last_name"])
        self.assertEqual(mc.first_name, "")
        self.assertEqual(mc.display_name, self.data["display_name"])
        self.assertEqual(mc.name, self.data["last_name"])
        self.assertEqual(mc.email, self.data["email"])
        self.assertIsInstance(mc.created, datetime)
