import tempfile
from pathlib import Path

import pytest
from django.core.exceptions import ValidationError
from PIL import Image

from hav.apps.tags.models import Tag
from hav.apps.webassets.hints import validate_webasset_hints
from hav.apps.webassets.operations.hints import get_hints_from_tags, rotation_tags
from hav.apps.webassets.operations.image import convert


def test_hints():

    with pytest.raises(ValidationError):
        validate_webasset_hints("image/jpeg", {"runtime": 500})

    img_valid = {"rotation": 90}
    assert (
        img_valid.items() <= validate_webasset_hints("image/jpeg", img_valid).items()
    ), "Valid does not raise"

    assert (
        img_valid.items() <= validate_webasset_hints("image", img_valid).items()
    ), "Incomplete mime type does not raise"

    with pytest.raises(ValidationError):
        validate_webasset_hints("", img_valid)

    with pytest.raises(ValidationError):
        validate_webasset_hints("image/jpeg", {"rotation": 42})


def test_hints_from_tags():
    tag = Tag(name="rotate:270")
    assert rotation_tags([tag]) == {"rotation": 270}
    assert get_hints_from_tags([tag]) == {"rotation": 270}


def test_max_resolution_hints():
    image_path = Path(__file__).parent / "testdata/image.jpg"
    with tempfile.NamedTemporaryFile(
        suffix=".jpg"
    ) as first_thumb, tempfile.NamedTemporaryFile(suffix="jpg") as second_thumb:
        convert(image_path.as_posix(), first_thumb.name, max_resolution=500)
        img = Image.open(first_thumb.name)
        assert max(img.width, img.height) <= 500

        first_thumb_dimensions = [img.width, img.height]

        # now rotate the image and check for equal dimensions
        original_image = Image.open(image_path)
        original_image = original_image.rotate(90, expand=True)
        original_image.save(second_thumb.name, "JPEG")

        convert(second_thumb.name, first_thumb.name, max_resolution=500)

        img = Image.open(first_thumb.name)
        assert max(img.width, img.height) <= 500

        second_thumb_dimensions = [img.width, img.height]
        # reverse height and width since we are dealing with a rotated image
        second_thumb_dimensions.reverse()
        assert first_thumb_dimensions == second_thumb_dimensions
