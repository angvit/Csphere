from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class NoteContentUpdate(BaseModel):
    notes: str
    bookmarkID: UUID

class ContentCreate(BaseModel):
    url: str
    title: Optional[str]
    notes: Optional[str]
    folder_id: Optional[UUID] = None
    html: str

class TabRemover(BaseModel):
    content_id: UUID 

class DBContent(BaseModel):
    url: str
    title: Optional[str]
    source: Optional[str]

class ContentWithSummary(BaseModel):
    content_id: UUID
    title: Optional[str]
    url: str
    source: Optional[str]
    first_saved_at: datetime 
    ai_summary: Optional[str]
    folder: Optional[str]

    class Config:
        from_attributes = True

class CategoryOut(BaseModel):
    category_id: UUID
    category_name: str

    class Config:
        from_attributes = True

class UserSavedContent(BaseModel):
    content_id: UUID
    url: str
    title: Optional[str]
    source: Optional[str]
    ai_summary: Optional[str]
    first_saved_at: datetime
    notes: Optional[str]
    tags: Optional[list[CategoryOut]]

class CategoryItem(BaseModel):
    category_id: str
    category_name: str
 
class UserSavedContentResponse(BaseModel):
    bookmarks: list[UserSavedContent]
    categories: Optional[list[CategoryOut] ]
    next_cursor: Optional[str]
    has_next: Optional[bool]