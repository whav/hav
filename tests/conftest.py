import pytest
from uuid import uuid4
from pathlib import Path

from django.core.files import File

from hav.apps.archive.models import ArchiveFile
from hav.apps.media.models import Media, MediaType
from hav.apps.hav_collections.models import Collection
from hav.apps.sets.models import Node
from hav.apps.webassets.operations import create_webassets
from hav.apps.webassets.models import WebAsset


@pytest.fixture
def collection(user):
    slug = str(uuid4())
    name = f"Collection:{slug}"[:30]
    root_node = Node.add_root(name=name, description=f"{name} - Root Node")
    collection = Collection.objects.create(
        type=1, name=name, short_name=name, root_node=root_node, slug=slug
    )
    collection.administrators.set([user])
    return collection


@pytest.fixture
def create_archive_file(user):
    created_files = []

    def _create_af():
        path = Path(__file__).parent / "webassets/testdata/image.jpg"
        assert path.exists()
        af = ArchiveFile(created_by=user)
        with path.open("rb") as f:
            af.file.save(path.name, File(f))

        af.save()
        webassets = create_webassets(af.pk)
        created_files.extend(webassets)
        created_files.append(af)
        return af

    yield _create_af
    for some_object in created_files:
        some_object.file.storage.delete(some_object.file.path)


@pytest.fixture
def create_user(django_user_model):
    def user_creator(**kwargs):
        username = str(uuid4())
        kwargs.setdefault("username", username)
        kwargs.setdefault("email", f"{username}@example.com")
        return django_user_model.objects.create(**kwargs)

    return user_creator


@pytest.fixture
def user(create_user):
    return create_user()


@pytest.fixture
def create_media(collection, create_archive_file):
    def _create_media(**kwargs):
        archive_file = create_archive_file()
        name = f"Media:{uuid4()}"
        media_type, _ = MediaType.objects.get_or_create(
            type=MediaType.DIGITAL, name=f"TestMediaType"
        )
        media = Media.objects.create(
            title=name,
            description=f"{name} - description",
            collection=collection,
            original_media_type=media_type,
            set=kwargs.get("set", collection.root_node),
            created_by=collection.administrators.get(),
        )
        media.files.set([archive_file])
        return media

    return _create_media


@pytest.fixture
def media(create_media):
    return create_media()


@pytest.fixture
def archive_file(create_archive_file):
    return create_archive_file()
