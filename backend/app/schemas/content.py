from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class ContentCreate(BaseModel):
    user_id: UUID
    url: str
    title: Optional[str] = None
    source: Optional[str] = None


class ContentRead(ContentCreate):
    content_id: UUID

    class Config:
        from_attributes=True