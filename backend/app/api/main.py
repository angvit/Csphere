import uvicorn 
from fastapi import FastAPI, Depends, Query, HTTPException, Request, Header
from sqlalchemy.orm import Session
from uuid import UUID
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from pydantic import BaseModel
from uuid import uuid4
from uuid import UUID
from dotenv import load_dotenv
from datetime import datetime
import os 

from app.db.database import get_db
from app.data_models.content import Content
from app.data_models.content_item import ContentItem
from app.schemas.content import ContentCreate, ContentRead
from app.schemas.user import UserCreate, UserSignIn
from app.utils.preprocessor import QueryPreprocessor
from app.embeddings.content_embedding_manager import ContentEmbeddingManager
from app.data_models.user import User
from app.db import init_db

from app.utils.hashing import get_password_hash, verify_password, create_access_token, decode_token

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.db.database import get_db
from app.data_models.user import User
from app.utils.auth import create_access_token

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


@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


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
   

@app.post("/content/saveUrl")
def save_url(ContentFromUrl, request: Request):
    token = request.cookies.get("token")

    print("Token from cookie:", token)
    #decode the token to get the user id
    user_id = None
    if token:
        token_data = decode_token(token)

        print("Decoded token data: ", token_data)
        user_id = token_data.username if token_data else None
        print("User ID from token: ", user_id)

    url = ContentFromUrl.url
    title = ContentFromUrl.title
    
    print("URL being saved: ", url ,"\n Title: ", title)
    return {"url": "saved", "title": title}


@app.get("/search")
def search(query: str, user_id: UUID = Query(...),db: Session = Depends(get_db)):
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
            "ai_summary": content_ai.ai_summary,
            "url": content.url
        }
        for content_ai, content in results
    ]


@app.post("/content/save", response_model=ContentRead)
def save_content(content: ContentCreate, db: Session = Depends(get_db), token: str = Header(...)):
    print("Content being saved: ", content)

    # Decode token to get user_id (from `sub`)
    token_data = decode_token(token)
    if not token_data or not token_data.username:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_id = token_data.username # this is the user_id (UUID as string)
    print("User ID from token: ", user_id)

    # Check if content already exists globally
    existing_content = db.query(Content).filter(Content.url == content.url).first()

    if not existing_content:
        new_content = Content(**content.model_dump())
        db.add(new_content)
        db.flush()
    else:
        new_content = existing_content

    # Check if this user already saved it
    existing_item = db.query(ContentItem).filter(
        ContentItem.user_id == user_id,
        ContentItem.content_id == new_content.content_id
    ).first()

    if existing_item:
        print("User already saved this content.")
        return new_content

    # Create ContentItem link
    content_item = ContentItem(
        user_id=user_id,
        content_id=new_content.content_id
    )

    db.add(content_item)
    db.commit()
    db.refresh(new_content)

    print("Successfully saved content for user.")
    return new_content


# gets all content for a specific user 
@app.get("/content", response_model=list[ContentRead])
def get_user_content(user_id: UUID = Query(...), db: Session = Depends(get_db)):
    return db.query(Content).filter(Content.user_id == user_id).all()


# gets a single piece of content for a specific user
@app.get("/content/{content_id}", response_model=ContentRead)
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