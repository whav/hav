from typing import Literal
from pydantic import BaseModel, ValidationError
from django.core.exceptions import ValidationError as DjangoValidationError

class ImageHints(BaseModel):
    rotation: Literal[0, 90, 180, 270]


def validate_webasset_hints(mime_type, value):
    if not value:
        return value

    mime_class = mime_type.split('/')[0]

    model = None
    if mime_class == 'image':
        model = ImageHints

    if model:
        try:
            model(**value)
        except ValidationError as e:
            raise DjangoValidationError(str(e))
    else:
        raise DjangoValidationError(f'Invalid hints for mime type {mime_type}.')

    return value

