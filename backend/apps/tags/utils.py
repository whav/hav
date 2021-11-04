from .models import Tag
from typing import List
from pydantic import BaseModel

import re

# ordering is important here as we use this list to also order the tags
location_prefixes = [
    "country",
    "province/state",
    "municipality",
    "city",
    "area",
    "place",
    "location",
    "location_detail",

]


location_prefixes_with_colons = [re.escape(f"{p}:") for p in location_prefixes]
location_pattern = re.compile(f"^{'|'.join(location_prefixes_with_colons)}")


class LocationTagModel(BaseModel):
    type: str
    name: str


def filter_by_prefix(tags: List[Tag], prefix: str) -> List[str]:
    values = []
    for tag in tags:
        name = tag.name.strip()
        if name.startswith(prefix):
            values.append(name.removeprefix(prefix))
    return values


def filter_location_tags(tags: List[Tag]) -> List[LocationTagModel]:
    # filter by location prefixes
    location_tags = []
    for tag in tags:
        if re.match(location_pattern, tag.name):
            location_tags.append(tag)

    # sort according to the initial location prefix list
    location_tags.sort(key=lambda t: location_prefixes.index(t.name.split(":")[0]))

    # and create more elaborate objects
    locations = []
    for tag in location_tags:
        location_type, location_name = tag.name.split(":", maxsplit=1)
        locations.append(LocationTagModel(type=location_type, name=location_name))

    return locations
