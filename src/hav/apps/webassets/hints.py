from typing import Literal, Optional

from django.core.exceptions import ValidationError as DjangoValidationError
from pydantic import BaseModel, ValidationError


class ImageHints(BaseModel):
    rotation: Optional[Literal[0, 90, 180, 270]]
    maxResolution: Optional[int]

    class Config:
        extra = "forbid"


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
