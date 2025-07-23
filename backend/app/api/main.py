import uvicorn 
from fastapi import FastAPI, Depends, Query, HTTPException, Request, Header, UploadFile, File
from sqlalchemy.orm import Session
from uuid import UUID
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine, func
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from uuid import uuid4
from uuid import UUID
from dotenv import load_dotenv
from datetime import datetime, timezone
import os 
import boto3
from fastapi.responses import RedirectResponse, JSONResponse
from urllib.parse import urlencode
from fastapi.responses import RedirectResponse, JSONResponse

import httpx


from app.db.database import get_db
from app.data_models.content import Content
from app.data_models.content_item import ContentItem
from app.data_models.content_ai import ContentAI
from app.data_models.folder import Folder
from app.data_models.folder_item import folder_item
from app.schemas.content import ContentCreate, ContentWithSummary, UserSavedContent, DBContent, TabRemover, NoteContentUpdate
from app.schemas.settings import UpdateSettings
from app.schemas.user import UserCreate, UserSignIn, UserGoogleCreate, UserGoogleSignIn, UserProfilePicture
from app.schemas.folder import FolderCreate, FolderDetails, FolderItem
from app.preprocessing.preprocessor import QueryPreprocessor
from app.embeddings.content_embedding_manager import ContentEmbeddingManager
from app.data_models.user import User
from app.db import init_db
from sqlalchemy import desc
from app.functions.AWS_s3 import extract_s3_key, get_presigned_url

from app.utils.hashing import get_password_hash, verify_password, create_access_token, decode_token, get_current_user_id


from app.routes import user_router, folder_router, auth_router, content_router, setting_router

# Load environment variables from a .env file
load_dotenv()


app = FastAPI()

# Update CORS origins
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

s3 = boto3.client(
    "s3",
    region_name="us-east-1",  
    aws_access_key_id=os.environ.get("AWS_ACCESS_KEY"),
    aws_secret_access_key=os.environ.get("AWS_SECRET_KEY"),
)

BUCKET_NAME = os.environ.get('BUCKET_NAME')
GOOGLE_REDIRECT_URI = os.environ.get('GOOGLE_REDIRECT_URI')
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

class ContentFromUrl(BaseModel):
    url: str
    title: str





app.include_router(user_router)
app.include_router(folder_router)
app.include_router(auth_router)
app.include_router(content_router)
app.include_router(setting_router)



if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.api.main:app", host="0.0.0.0", port=port)



