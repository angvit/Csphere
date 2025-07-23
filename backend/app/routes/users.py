from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from app.dependencies import get_current_user_id
from app.db.database import get_db
from app.schemas.user import UserCreate, UserSignIn, UserGoogleCreate, UserGoogleSignIn, UserProfilePicture
from app.utils.hashing import get_password_hash, verify_password, create_access_token, decode_token, get_current_user_id
from app.data_models.user import User
from app.functions.AWS_s3 import extract_s3_key, get_presigned_url
from datetime import datetime, timezone
from uuid import uuid4
from uuid import UUID
import boto3

import os


router = APIRouter(
    prefix="/user",
    tags=['user'],
    dependencies=[]
)
BUCKET_NAME = os.environ.get('BUCKET_NAME')


s3 = boto3.client(
    "s3",
    region_name="us-east-1",  
    aws_access_key_id=os.environ.get("AWS_ACCESS_KEY"),
    aws_secret_access_key=os.environ.get("AWS_SECRET_KEY"),
)

# """
#     Fetches the body parts from the database based on pagination parameters.

#     Parameters:
#         db (Session): The database session.
#         pagination_params (dict): The pagination parameters.

#     Returns:
#     BodyPartsInDB: The fetched body parts from the database.
# """ 
@router.post("/signup")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
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
    presigned_url = ''
    if (new_user.profile_path != ''):
        presigned_url = get_presigned_url(new_user.profile_path)
    token =create_access_token(data={"sub": str(new_user.id), "email" : str(new_user.email), "username" : str(new_user.username), "profilePath" : presigned_url})
    

    return {'success': True, 'message': 'Google signup was succesful', 'token': token}


@router.post("/login")
def login(user: UserSignIn,  db: Session = Depends(get_db)):
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
    
    presigned_url = ''
    if db_user.profile_path != '' and db_user.profile_path != None:
        presigned_url = get_presigned_url(db_user.profile_path)
    print("presigned url; ", presigned_url)
    token = create_access_token(data={"sub": str(db_user.id), "email" : str(db_user.email), "username" : str(db_user.username), "profilePath" : presigned_url})
    print("Token created: ", token)

    return {"username": db_user.username, "token": token}


@router.get("/media/profile")
def get_profile_picture(profile_url: str = Query(...), user_id: UUID = Depends(get_current_user_id)):
    print("profile url: ", profile_url)
    presigned_url = s3.generate_presigned_url(
    ClientMethod="get_object",
    Params={
        "Bucket": BUCKET_NAME,
        "Key": extract_s3_key(profile_url)
    },
    ExpiresIn=3600  # seconds = 1 hour

   
    )

    print("pre signed url: ", presigned_url)
    
    return {'success' : True, "presigned_url": presigned_url}



@router.post("/media")
def upload_user_media(pfp: UploadFile = File(...), user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):
    filename = f"pfps/{uuid4().hex}_{pfp.filename}"
    try:
        s3.upload_fileobj(
            pfp.file,
            BUCKET_NAME,
            filename,
            ExtraArgs={
            
                "ContentType": pfp.content_type,
            },
        )

        image_url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{filename}"

        presigned_url = get_presigned_url(image_url)
        #save to the users DB 

        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            return {'success': False, 'message': "no user found with the user_id"}
        
        user.profile_path = image_url
        db.commit()
    except Exception as e:
        return {'success' : False, 'error': str(e)}


    
    print("returning presigned url: ", presigned_url)

    return {"success":True,"profile_media": presigned_url}




@router.post("/google/signup")
def google_signup(user: UserGoogleCreate,  db: Session = Depends(get_db)):
    print(user)

    #Check for existing user
    existing_user = db.query(User).filter(User.email == user.email and User.google_id == user.google_id).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Google account already registered")
    

    new_user = User(
        id=uuid4(),  # Generate UUID for the user
        username=user.username,
        email=user.email,
        password='',
        created_at=datetime.utcnow() ,
        google_id=user.google_id
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)  # Refresh to get the user with the generated ID
    presigned_url = ''
    if (new_user.profile_path != ''):
        presigned_url = get_presigned_url(new_user.profile_path)
    print("presigned url: ", presigned_url)

    token = create_access_token(data={"sub": str(new_user.id), "email" : str(new_user.email), "username" : str(new_user.username), "profilePath" : presigned_url})
    






    return {'success': True, 'message': 'Google signup was succesful', 'token': token}





@router.post("/google/login")
def google_login(user : UserGoogleSignIn, db : Session =  Depends(get_db)):
    db_user = db.query(User).filter(user.google_id == User.google_id).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="User not found")
    
    
    profile_path = ''
    if db_user.profile_path != None and db_user.profile_path != '':
        profile_path = get_presigned_url(db_user.profile_path)
    token = create_access_token(data={"sub": str(db_user.id), "email" : str(db_user.email), "username" : str(db_user.username), "profilePath" : str(profile_path)})

    return {'message' : 'user found', 'token' : token, 'success' : True}




@router.post("/chrome/login")
def chrome_login(user: UserSignIn,  db: Session = Depends(get_db)):
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
    
    presigned_url = ''
    if db_user.profile_path != '' and db_user.profile_path != None:
        presigned_url = get_presigned_url(db_user.profile_path)
    print("presigned url; ", presigned_url)
    token = create_access_token(data={"sub": str(db_user.id), "email" : str(db_user.email), "username" : str(db_user.username), "profilePath" : presigned_url})
    print("Token created: ", token)

    return {"username": db_user.username, "token": token, "detail" : 'sucessful login'}



@router.post("/google")
def connect_google_account(user: UserGoogleCreate, user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):
    try:
        google_id = user.google_id
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            return {"success" : False, "message" : "no user found for current user id"}
        
        user.google_id = google_id
        db.commit()
        return {"success" : True, "message" : "google ID connected for user"}
    
    except Exception as e:
        return {"success" : False, "message" : f"Following error occured: {e}"}