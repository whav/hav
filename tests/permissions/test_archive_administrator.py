import pytest


@pytest.mark.django_db
def test_collection_admin(collection):
    assert collection
    assert collection.administrators.count() == 1
