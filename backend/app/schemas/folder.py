from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class FolderDetails(BaseModel):
    foldername: str = Field(..., min_length=1) 
    folderId: Optional[UUID]

class FolderCreate(BaseModel):
    folder_id: str 
    user_id: str
    parent_id : str
    folder_name: str
    created_at: datetime = None 
