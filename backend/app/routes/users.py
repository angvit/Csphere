from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_current_user_id
from app.db.database import get_db
from app.schemas.user import UserCreate, UserSignIn, UserGoogleCreate, UserGoogleSignIn, UserProfilePicture
from app.utils.hashing import get_password_hash, verify_password, create_access_token, decode_token, get_current_user_id
from app.data_models.user import User
from app.functions.AWS_s3 import extract_s3_key, get_presigned_url
from datetime import datetime, timezone
from uuid import uuid4



router = APIRouter(
    prefix="/user",
    tags=['user'],
    dependencies=[]
)


# """
#     Fetches the body parts from the database based on pagination parameters.

#     Parameters:
#         db (Session): The database session.
#         pagination_params (dict): The pagination parameters.

#     Returns:
#     BodyPartsInDB: The fetched body parts from the database.
# """ 
router.post("/signup")
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


