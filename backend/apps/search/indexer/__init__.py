from enum import Enum
from typing import List, Optional
from pydantic import BaseModel


class ItemType(str, Enum):
    folder = "folder"
    media = "media"


class SearchIndexItem(BaseModel):
    id: str

    # searchable attributes
    title: str
    additional_titles: List[str] = []
    body: str
    tags: List[str] = []

    # non-searchable attributes
    type: ItemType
    collection: str
    pk: int
    parents: List[int] = []
    node: Optional[int]
    last_update: float
