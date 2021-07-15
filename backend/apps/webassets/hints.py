from typing import Literal, Optional
from pydantic import BaseModel, ValidationError
from django.core.exceptions import ValidationError as DjangoValidationError


class ImageHints(BaseModel):
    rotation: Optional[Literal[0, 90, 180, 270]]
    maxResolution: Optional[int]


def validate_webasset_hints(mime_type, value):
    if not value:
        return value

    mime_class = mime_type.split("/")[0]

    model = None
    if mime_class == "image":
        model = ImageHints

    if model:
        try:
            validated = model(**value)
        except ValidationError as e:
            raise DjangoValidationError(str(e))
        else:
            return validated.dict()

    raise DjangoValidationError(f"Invalid hints for mime type {mime_type}.")
