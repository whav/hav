from typing import Literal, Optional

from django.core.exceptions import ValidationError as DjangoValidationError
from pydantic import BaseModel, ConfigDict, ValidationError


class ImageHints(BaseModel):
    model_config = ConfigDict(extra="forbid")

    rotation: Optional[Literal[0, 90, 180, 270]] = None
    maxResolution: Optional[int] = None


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
            return validated.model_dump()

    raise DjangoValidationError(f"Invalid hints for mime type {mime_type}.")
