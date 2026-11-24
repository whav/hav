import pytest
from django.urls import reverse

from hav.apps.pages.models import Page

SLUGS = ["accessibility", "cooperation", "imprint", "index", "open-knowledge"]


@pytest.mark.django_db
def test_former_flatpage_files_are_imported():
    assert list(Page.objects.values_list("slug", flat=True)) == SLUGS
    assert Page.objects.get(slug="index").content.startswith(
        "# The Himalaya Archive Vienna"
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "url, text",
    [
        ("/", b"<h1>The Himalaya Archive Vienna</h1>"),
        ("/imprint/", b"<h1>Imprint</h1>"),
        ("/open-knowledge/", b"<h1>Open Access, Open Knowledge and Licenses</h1>"),
    ],
)
def test_pages_are_served(client, url, text):
    resp = client.get(url)
    assert resp.status_code == 200
    assert text in resp.content


@pytest.mark.django_db
def test_unknown_page(client):
    assert client.get("/no-such-page/").status_code == 404


@pytest.mark.django_db
def test_edited_content_is_served(client):
    Page.objects.filter(slug="imprint").update(content="# New imprint")
    assert b"<h1>New imprint</h1>" in client.get("/imprint/").content


# admin: superusers only

CHANGELIST = reverse("admin:pages_page_changelist")


def change_url(slug):
    return reverse("admin:pages_page_change", args=[Page.objects.get(slug=slug).pk])


@pytest.mark.django_db
def test_admin_hidden_from_staff(client, create_user):
    staff = create_user(is_staff=True)
    client.force_login(staff)
    assert client.get(CHANGELIST).status_code == 403
    assert client.get(change_url("imprint")).status_code == 403
    assert b"/pages/" not in client.get(reverse("admin:index")).content


@pytest.mark.django_db
def test_admin_requires_login(client):
    resp = client.get(CHANGELIST)
    assert resp.status_code == 302
    assert "login" in resp.url


@pytest.mark.django_db
def test_superuser_can_edit(client, create_user):
    admin = create_user(is_staff=True, is_superuser=True)
    client.force_login(admin)
    assert client.get(CHANGELIST).status_code == 200

    url = change_url("imprint")
    data = {"slug": "imprint", "title": "Imprint", "content": "# Edited imprint"}
    assert client.post(url, data).status_code == 302
    assert Page.objects.get(slug="imprint").content == "# Edited imprint"


@pytest.mark.django_db
def test_invalid_content_is_rejected(client, create_user):
    client.force_login(create_user(is_staff=True, is_superuser=True))
    data = {"slug": "imprint", "title": "Imprint", "content": "![](media:999999)"}
    resp = client.post(change_url("imprint"), data)
    assert resp.status_code == 200  # form shown again with the error
    assert b"media:999999 does not exist" in resp.content
