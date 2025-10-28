from fastapi import APIRouter, Depends, HTTPException
from app.db.database import get_db

from app.schemas.settings import UpdateSettings

from app.data_models.user import User

from app.utils.hashing import get_password_hash,get_current_user_id
from sqlalchemy.orm import Session
from uuid import UUID

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

