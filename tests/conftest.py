import pytest
from uuid import uuid4
from pathlib import Path

from django.core.files import File

from apps.archive.models import ArchiveFile
from apps.media.models import Media, MediaType
from apps.hav_collections.models import Collection
from apps.sets.models import Node
from apps.webassets.operations import create_webassets


@pytest.fixture
def user(django_user_model):
    username = str(uuid4)[:30]
    return django_user_model.objects.create(
        username=username, email=f"{username}@example.com"
    )


@pytest.fixture
def collection(user):

    name = f"Collection:{str(uuid4())}"[:30]
    root_node = Node.add_root(name=name, description=f"{name} - Root Node")
    collection = Collection.objects.create(
        type=1, name=name, short_name=name, root_node=root_node
    )
    collection.administrators.set([user])
    return collection


@pytest.fixture
def archive_file(user):
    path = Path(__file__).parent / "webassets/testdata/image.jpg"
    assert path.exists()
    af = ArchiveFile(created_by=user)
    with path.open("rb") as f:
        af.file.save(path.name, File(f))

    af.save()
    create_webassets(af.pk)
    return af


@pytest.fixture
def media(collection, archive_file):
    name = f"Media:{uuid4()}"

    media_type = MediaType.objects.create(type=MediaType.DIGITAL, name=f"TestMediaType")
    media = Media.objects.create(
        title=name,
        description=f"{name} - description",
        collection=collection,
        original_media_type=media_type,
        set=collection.root_node,
        created_by=collection.administrators.get(),
    )
    media.files.set([archive_file])
    return media
