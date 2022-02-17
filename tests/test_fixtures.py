import pytest


@pytest.mark.django_db
def test_media_fixture(media):
    collection = media.collection
    assert collection

    archive_file = media.files.all()[0]
    assert archive_file.file.storage.exists(
        archive_file.file.name
    ), "ArchiveFile exists"

    assert archive_file.webasset_set.count(), "Webassets exist"
    for wa in archive_file.webasset_set.all():
        assert wa.file.storage.exists(wa.file.path)


@pytest.mark.django_db
def test_collection_fixture(collection):
    assert (
        collection.administrators.count()
    ), "Collection has a at least one administrator"
    assert collection.root_node, "Collection root node is set"
