import uvicorn 
from fastapi import FastAPI, Depends, Query, HTTPException, Request, Header
from sqlalchemy.orm import Session
from uuid import UUID
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from uuid import uuid4
from uuid import UUID
from dotenv import load_dotenv
from datetime import datetime
import os 

from app.db.database import get_db
from app.data_models.content import Content
from app.data_models.content_item import ContentItem
from app.data_models.content_ai import ContentAI
from app.schemas.content import ContentCreate, ContentWithSummary
from app.schemas.user import UserCreate, UserSignIn
from app.utils.preprocessor import QueryPreprocessor
from app.embeddings.content_embedding_manager import ContentEmbeddingManager
from app.data_models.user import User
from app.db import init_db

from app.utils.hashing import get_password_hash, verify_password, create_access_token, decode_token, get_current_user_id

load_dotenv()

app = FastAPI()

# change link later once deployed
origins = [
    "*",
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class ContentFromUrl(BaseModel):
    url: str
    title: str


@app.post("/api/signup", response_model=UserCreate)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    print("User being created: ", user)

    if not user:
        raise HTTPException(status_code=400, detail="Invalid user data")
    
    hashed_password = get_password_hash(user.password)
    print("Hashed password: ", hashed_password)
    user.password = hashed_password

    # Check if user already exists by username
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    #Insert user into the database
    new_user = User(
        id=uuid4(),  # Generate UUID for the user
        username=user.username,
        email=user.email,
        password=user.password,
        created_at=datetime.utcnow() if not user.created_at else user.created_at,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)  # Refresh to get the user with the generated ID

    print("User created: ", new_user)

    return {"username": user.username, "email": user.email, "password": user.password}


@app.post("/api/login")
def login(user: UserSignIn,  request: Request, db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(status_code=400, detail="Invalid user data")

    # Check if the user exists
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user:
        print("User not found: ", user.username)
        raise HTTPException(status_code=400, detail="User not found")
    
    print("User found: ", db_user, "id of user: ", db_user.id)

    # Verify the password
    if not verify_password(user.password, db_user.password):
        print("Incorrect password for user: ", user.username)
         # If the password is incorrect, raise an HTTPException
         # This will return a 400 status code with the detail "Incorrect password"
        raise HTTPException(status_code=400, detail="Incorrect password")
    
    token = create_access_token(data={"sub": str(db_user.id)})
    print("Token created: ", token)

    return {"username": db_user.username, "token": token}
   

@app.get("/search", response_model=list[ContentWithSummary])
def search(query: str, user_id: UUID = Depends(get_current_user_id),db: Session = Depends(get_db)):
    preprocessor = QueryPreprocessor()
    parsed_query = preprocessor.preprocess_query(query)

    manager = ContentEmbeddingManager(db)
    results = manager.query_similar_content(
        query=parsed_query,
        user_id=user_id,
    )

    return [
    {
        "content_id": content_ai.content_id,
        "title": content.title,
        "url": content.url,
        "source": content.source,
        "first_saved_at": content.first_saved_at,
        "ai_summary": content_ai.ai_summary,
    }
    for content_ai, content in results
    ]


@app.post("/content/save", response_model=ContentWithSummary)
def save_content(content: ContentCreate, db: Session = Depends(get_db), request: Request = None):
    token = request.headers.get("Authorization")[7:] if request.headers.get("Authorization") else None
    print("Token from header:", token)
    if not token:
        raise HTTPException(status_code=401, detail="Token not provided")
    
    #decode the token to get the user id
    data = decode_token(token) 
    print("Decoded token data: ", data)
    if not data:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = data.username 

    print("User ID from token: ", user_id)
    print("Content being saved: ", content)

    # Check if content already exists globally
    existing_content = db.query(Content).filter(Content.url == content.url).first()

    if not existing_content:
        print("New Content link")
        new_content = Content(**content.model_dump(), user_id=user_id)
        db.add(new_content)
        db.flush() # generate content_id

        # only embed if new content
        embedding_manager = ContentEmbeddingManager(db)
        content_ai = embedding_manager.process_content(new_content)
        db.commit()

        if not content_ai:
            print("Embedding generation failed or skipped.")
        else:
            print("Summary Generated:", content_ai.ai_summary)
    else:
        print("Existing content link")
        new_content = existing_content
        content_ai = db.query(ContentAI).filter_by(content_id=new_content.content_id).first()

    # Check if this user already saved it
    existing_item = db.query(ContentItem).filter(
        ContentItem.user_id == user_id,
        ContentItem.content_id == new_content.content_id
    ).first()

    if not existing_item:
        db.add(ContentItem(user_id=user_id, content_id=new_content.content_id))
        db.commit()

    print("Successfully saved content for user.")
    return ContentWithSummary(
        content_id=new_content.content_id,
        url=new_content.url,
        title=new_content.title,
        source=new_content.source,
        first_saved_at=new_content.first_saved_at,
        ai_summary=content_ai.ai_summary if content_ai else None
    )


# gets all content for a specific user 
@app.get("/content", response_model=list[ContentWithSummary])
def get_user_content(user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):
    print(f"Fetching content for user_id: {user_id}")
    
    results = (
        db.query(Content, ContentAI.ai_summary)
        .join(ContentAI, Content.content_id == ContentAI.content_id)
        .filter(Content.user_id == user_id)
        .all()
    )

    print(f"Total results found: {len(results)}")

    response = [
        ContentWithSummary(
            content_id=content.content_id,
            url=content.url,
            title=content.title,
            source=content.source,
            first_saved_at=content.first_saved_at,
            ai_summary=ai_summary
        )
        for content, ai_summary in results
    ]

    return response


# gets a single piece of content for a specific user
@app.get("/content/{content_id}", response_model=ContentWithSummary)
def get_piece_content(content_id: UUID, user_id: UUID = Query(...), db: Session = Depends(get_db)):
    content = db.query(Content).filter(Content.content_id == content_id, Content.user_id == user_id).first()

    if not content:
        raise HTTPException(status_code=404, detail="Content not found for this user")
    return content


app.delete("/content/{content_id}", status_code=204)
def delete_content(content_id: UUID, user_id: UUID, db: Session=Depends(get_db)):
    content = db.query(Content).filter(Content.content_id == content_id, Content.user_id == user_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found or not owned by user")

    db.delete(content)
    db.commit()
    return