from fastapi import APIRouter, Depends, HTTPException, Query
from app.db.database import get_db
from app.data_models.content import Content
from app.data_models.content_item import ContentItem
from app.data_models.content_ai import ContentAI
from app.data_models.folder import Folder
from app.data_models.folder_item import folder_item
from app.schemas.content import ContentCreate, ContentWithSummary, UserSavedContent, DBContent, TabRemover, NoteContentUpdate
from app.schemas.settings import UpdateSettings
from app.preprocessing.preprocessor import QueryPreprocessor
from app.embeddings.content_embedding_manager import ContentEmbeddingManager
from app.data_models.user import User
from datetime import datetime, timezone

from app.utils.hashing import get_password_hash, verify_password, create_access_token, decode_token, get_current_user_id
from sqlalchemy.orm import Session
from uuid import UUID
from sqlalchemy import desc, func

router = APIRouter(
    prefix="/setting"
)



@router.post("/update")
def update(content : UpdateSettings,user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):

    settings_entry = db.query(User).filter(User.id == user_id).first()

    if not settings_entry:
        raise HTTPException(
            status_code=404,
            detail="Settings for this user were not found."
        )
    print("Content dictionary : ", content.dict())

    updates = {
        key: get_password_hash(value) if key == 'password' else value
        for key, value in content.dict(exclude_unset=True).items()
        if value not in (None, "")
    }


    for key, value in updates.items():
        setattr(settings_entry, key, value)

    db.commit()
    db.refresh(settings_entry)

    return {
        "message": "Settings successfully updated.",
        "user_id": user_id,
        "updated_fields": content.dict(exclude_unset=True)
    }

