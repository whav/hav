from django.urls import reverse
from django.conf import settings


def test_graphql_view_permissions(client, admin_client):
    graphql_endpoint = reverse("api:graphql")
    resp = client.get(graphql_endpoint)

    assert resp.status_code == 302
    assert "/login/" in resp.url

    resp = admin_client.get(graphql_endpoint, HTTP_ACCEPT="text/html")
    assert resp.status_code == 200