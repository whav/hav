import pytest
from ..hints import validate_webasset_hints
from ..operations.hints import get_hints_from_tags, rotation_tags
from django.core.exceptions import ValidationError
from apps.tags.models import Tag
from apps.hav_collections.models import Collection


def test_hints():

    with pytest.raises(ValidationError):
        validate_webasset_hints("image/jpeg", {"runtime": 500})

    img_valid = {"rotation": 90}

    assert (
        validate_webasset_hints("image/jpeg", img_valid) == img_valid
    ), "Valid does not raise"
    assert (
        validate_webasset_hints("image", img_valid) == img_valid
    ), "Incomplete mime type does not raise"

    with pytest.raises(ValidationError):
        validate_webasset_hints("", img_valid)

    with pytest.raises(ValidationError):
        validate_webasset_hints("image/jpeg", {"rotation": 42})


def test_hints_from_tags():
    tag = Tag(name="rotate:270")
    assert rotation_tags([tag]) == {"rotation": 270}
    assert get_hints_from_tags([tag]) == {"rotation": 270}
