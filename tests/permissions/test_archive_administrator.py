import pytest
from django.contrib.auth.models import AnonymousUser

from hav.apps.accounts.permissions import can_view_media, can_view_webassets


@pytest.mark.django_db
def test_collection_admin(collection, media, create_user):
    user = create_user()
    collection_admin = collection.administrators.get()
    anon_user = AnonymousUser()
    # add a media entry to it
    media.set = collection.root_node
    media.is_private = True
    media.save()

    webasset = media.primary_image_webasset

    assert not media.is_public

    assert user != collection_admin

    assert can_view_media(collection_admin, media), "Admins can view private media"
    assert can_view_webassets(
        collection_admin, webasset
    ), "Admins can view webassets of private media entries"

    assert not can_view_media(user, media), "Non-admin users can not view private media"
    assert not can_view_webassets(
        user, webasset
    ), "Non-admin users can not view webassets of private media"

    assert not can_view_media(
        anon_user, media
    ), "Non-admin users can not view private media"
    assert not can_view_webassets(
        anon_user, webasset
    ), "Non-admin users can not view webassets of private media"
