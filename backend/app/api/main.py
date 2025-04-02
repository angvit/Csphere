import uvicorn 
from fastapi import FastAPI, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import get_db
from app.data_models.content import Content
from app.data_models.content_item import ContentItem
from app.schemas.content import ContentCreate, ContentRead

app = FastAPI()

# change link later once deployed
origins = [
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.post("/content/save", response_model=ContentRead)
def save_content(content: ContentCreate, db: Session = Depends(get_db)):
    new_content = Content(**content.model_dump())
    db.add(new_content)
    db.commit()
    db.refresh(new_content)
    return new_content


@app.get("/content", response_model=list[ContentRead])
def get_user_content(user_id: UUID = Query(...), db: Session = Depends(get_db)):
    return db.query(Content).filter(Content.user_id == user_id).all()


app.delete("/content/{content_id}", status_code=204)
def delete_content(content_id: UUID, user_id: UUID, db: Session=Depends(get_db)):
    content = db.query(Content).filter(Content.content_id == content_id, Content.user_id == user_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found or not owned by user")

    db.delete(content)
    db.commit()
    return








