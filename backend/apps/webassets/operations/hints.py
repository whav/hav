from typing import List
from apps.tags.models import Tag
import mimetypes
import copy
import re
import logging

logger = logging.getLogger(__name__)


def rotation_tags(tags: List[Tag]):
    pattern = re.compile(r"^rotate:(\d+)")

    for tag in tags:
        if (match := pattern.match(tag.name)) :
            return {"rotation": int((match.group(1)))}


def get_hints_from_tags(tags: List[Tag]):
    hints = {}
    operations = [
        rotation_tags,
    ]
    for func in operations:
        result = func(tags)
        if result:
            hints.update(result)

    return hints
