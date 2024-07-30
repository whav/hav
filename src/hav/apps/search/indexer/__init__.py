from typing import List, Optional

from pydantic import BaseModel

ItemType = {"folder": "folder", "media": "media"}


class SearchIndexItem(BaseModel):
    id: str

    # searchable attributes
    title: str
    additional_titles: List[str] = []
    body: str
    tags: List[str] = []
    location_tags: List[str] = []
    creators: List[str] = []
    creation_years: List[int] = []

    # non-searchable attributes
    type: str
    collection: str
    pk: int
    parents: List[int] = []
    node: Optional[int] = None
    last_update: float
