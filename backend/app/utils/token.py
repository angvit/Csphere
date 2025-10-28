from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from typing import Annotated
from uuid import UUID
from jwt import exceptions as jwt_exceptions
from app.utils.hashing import get_password_hash, verify_password, create_access_token, get_current_user_id
from app.functions.AWS_s3 import extract_s3_key, get_presigned_url

from app.data_models.user import User
import jwt

from app.db.database import get_db
import logging

logger = logging.getLogger(__name__) 



class Token():
    def __init__(self, user_id : str):
        self.user_id =  user_id
        self.db = next(get_db())


    def createAccessTokenWithUserId(self) -> str:

        #access the DB

        #token =create_access_token(data={"sub": str(new_user.id), "email" : str(new_user.email), "username" : str(new_user.username), "profilePath" : presigned_url})


        try:
            user_data = self.db.query(User.id, User.email, User.username, User.profile_path.label('profilePath')).filter(User.id == self.user_id).first()


            #set the presigned url
            if user_data.profilePath:
                presigned_url = get_presigned_url(user_data.profilePath)

            data = {
                "sub" : str(self.user_id), 
                "email" : user_data.email, 
                "username": user_data.username, 
                "profilePath" : presigned_url, 

            }

            token = create_access_token(data=data)

            return token








        except Exception as e:
            logger.error(f"Error occured in Token class method createAccessTokenWithUserId: {e}")




    
