import pytest
from django.urls import reverse
from apps.hav_collections.models import Collection


@pytest.mark.django_db
def test_home(client):
    resp = client.get("/")
    assert resp.status_code == 200


@pytest.mark.django_db
def test_collection_roots(client):
    collections = Collection.objects.all()
    for collection in collections:
        url = reverse(
            "hav:collection_root", kwargs={"collection_slug": collection.slug}
        )
        resp = client.get(url)
        assert resp.status_code == 200
