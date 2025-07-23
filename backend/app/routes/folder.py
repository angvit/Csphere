from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from app.dependencies import get_current_user_id
from app.data_models.folder import Folder
from app.data_models.folder_item import folder_item
from sqlalchemy import desc, func
from app.data_models.content import Content
from app.data_models.content_item import ContentItem
from app.data_models.content_ai import ContentAI

from app.db.database import get_db
from app.schemas.user import UserCreate, UserSignIn, UserGoogleCreate, UserGoogleSignIn, UserProfilePicture
from app.schemas.folder import FolderCreate, FolderDetails, FolderItem

from app.utils.hashing import get_password_hash, verify_password, create_access_token, decode_token, get_current_user_id
from app.data_models.user import User
from app.functions.AWS_s3 import extract_s3_key, get_presigned_url
from datetime import datetime, timezone
from uuid import uuid4
from uuid import UUID
import boto3

import os


router = APIRouter(
    # prefix="/user",
    tags=['folder'],
)



@router.get("/folder")
def get_folders( user_id: UUID=Depends(get_current_user_id), db:Session = Depends(get_db)):

    try:

        
 
        folders= db.query(Folder).filter(Folder.user_id == user_id and Folder.folder_id == Folder.parent_id ).order_by(desc(Folder.created_at)).all()


        res = []

        for folder in folders:
            file_count = db.query(func.count(folder_item.folder_id)).filter(folder_item.folder_id == folder.folder_id).scalar()
            folder_data = {
                "folderId" : folder.folder_id, 
                "createdAt" : folder.created_at, 
                "folderName": folder.folder_name,
                "parentId": folder.folder_id, 
                "fileCount": file_count

            }
            res.append(folder_data)

        return {'success' : True, 'data' : res}
    except Exception as e:
        return {'success' : False, 'error' : str(e)}





@router.get("/folder-path/{folder_id}")
def get_folder_path(folder_id: UUID, user_id: UUID=Depends(get_current_user_id), db: Session = Depends(get_db)):
    path = []
    current = db.query(Folder).filter(Folder.folder_id == folder_id, Folder.user_id == user_id).first()
    while current:
        path.insert(0, {"name": current.folder_name, "id": str(current.folder_id)})
        if not current.parent_id or current.parent_id == current.folder_id:
            break
        current = db.query(Folder).filter(Folder.folder_id == current.parent_id, Folder.user_id == user_id).first()
    return {"path": path}




@router.get("/folder/{folder_id}")
def get_folder_items(
    folder_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    print("current folder id: ", folder_id)
    folder_bookmarks = (
        db.query(Content, ContentItem.notes, ContentItem.saved_at, ContentAI.ai_summary)
        .join(folder_item, folder_item.content_id == Content.content_id)
        .join(ContentItem, (ContentItem.content_id == Content.content_id) & (ContentItem.user_id == user_id))
        .outerjoin(ContentAI, ContentAI.content_id == Content.content_id)  # AI is optional
        .filter(folder_item.folder_id == folder_id)
        .filter(folder_item.user_id == user_id)
        .order_by(desc(Content.first_saved_at))
        .all()
    )

    print("folder_id:", folder_id, "| results:", folder_bookmarks)

    return [
        {
            "content_id": content.content_id,
            "url": content.url,
            "title": content.title,
            "source": content.source,
            "ai_summary": ai_summary,
            "first_saved_at": saved_at,
            "notes": notes,
        }
        for content, notes, saved_at, ai_summary in folder_bookmarks
    ]


#change to PUT router later
@router.post("/users/folder/add")
def add_to_folder(itemDetails: FolderItem, user_id: UUID=Depends(get_current_user_id), db: Session = Depends(get_db)):

    #make sure item isn't already in the DB

    present = db.query(folder_item).filter(itemDetails.contentId == folder_item.content_id, itemDetails.folderId == folder_item.folder_id, user_id == folder_item.user_id).first()

    if present:
        raise HTTPException(status_code=400, detail="Item already in the folder")
    
    try:
        new_item = folder_item(
            folder_item_id = uuid4(), 
            folder_id = itemDetails.folderId,
            user_id = user_id, 
            content_id = itemDetails.contentId,
            added_at = datetime.utcnow()

        )

        db.add(new_item)
        db.commit()
        db.refresh(new_item)

        return {'success' : True, 'message' : 'Bookmark added to folder'} 


    except Exception as e:
        return {'success': False, 'message' : str(e)} 
    


@router.get("/users/folders")
def get_users_folders( user_id: UUID=Depends(get_current_user_id), db: Session = Depends(get_db)):
    #this api only gets folders that have no parwsnts
    usersFolders = db.query(Folder).filter(Folder.user_id == user_id, Folder.folder_id == Folder.folder_id).all()

    if not usersFolders:
        return {'success' : True, 'data' : []}
    

    #process the data
    res = []
    for folder in usersFolders:
        data = {
            "folder_id": folder.folder_id,
            "folder_name": folder.folder_name

        }
        res.append(data)
    

    print("all folders for current user: ", usersFolders)

    return {'success' : True, 'data' : res}


#Edit the api endpoint protocol later
@router.post("/user/folder/create")
def create_folder(folderDetails: FolderDetails, user_id: UUID=Depends(get_current_user_id), db: Session = Depends(get_db)):
    print("folder details: ", folderDetails)

    #check for existing folders with the same name under the same user_id
    duplicates = db.query(Folder).filter(
    Folder.user_id == user_id,
    Folder.folder_name == folderDetails.foldername
        ).all()
    print(f"Found {len(duplicates)} folders with same name and user.")

    if duplicates:
        print("folder already exists: ", duplicates)
        raise HTTPException(status_code=400, detail="Folder already exists") 
    
    folder_uuid = uuid4()
    
    try:
        new_folder = Folder(
            folder_id = folder_uuid,
            user_id= user_id, 
            parent_id = folderDetails.folderId if folderDetails.folderId else folder_uuid,
            folder_name = folderDetails.foldername,
            created_at=datetime.utcnow() 
        )
        db.add(new_folder)
        db.commit()
        db.refresh(new_folder)
        

        folder_details = {
            'folder_id' : new_folder.folder_id,
            'created_at' : new_folder.created_at, 
            'folder_name' : new_folder.folder_name,
            'parent_id' : new_folder.parent_id,
            'file_count' : 0

        }

        return {'success' : True, 'message' : 'folder created successfully', 'folder_details': folder_details}


    except Exception as e:
        return {'success' : False, 'message' : str(e)}
