from uuid import uuid4

from hav.apps.accounts.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from hav.views.api.v1.misc_models.urls import urlpatterns


class MiscModelsAPITest(APITestCase):

    data = {"name": "Test Creator"}

    def setUp(self):
        self.user = User.objects.create_superuser(
            "tester", "test@example.com", str(uuid4())
        )
        self.url = reverse("api:v1:models:creators")

    def test_listings(self):
        for pattern in urlpatterns:
            url = reverse(f"api:v1:models:{pattern.name}")
            response = self.client.get(url, format="json")
            self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

            self.client.force_login(self.user)
            response = self.client.get(url, format="json")
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.client.logout()
