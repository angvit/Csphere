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

# Load environment variables from a .env file
load_dotenv()

# Access the environment variable for frontend origin
# FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN")
# if not FRONTEND_ORIGIN:
#     raise ValueError("Environment variable FRONTEND_ORIGIN is not set.")

# print("Frontend Origin:", FRONTEND_ORIGIN)

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
    region_name="us-east-1",  # change this to your S3 region
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


@app.post("/api/signup")
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
    presigned_url = ''
    if (new_user.profile_path != ''):
        presigned_url = get_presigned_url(new_user.profile_path)
    token =create_access_token(data={"sub": str(new_user.id), "email" : str(new_user.email), "username" : str(new_user.username), "profilePath" : presigned_url})
    

    return {'success': True, 'message': 'Google signup was succesful', 'token': token}




@app.get("/user/media/profile")
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


@app.post("/user/media")
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



@app.post("/api/google/signup")
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


@app.post("/api/google/login")
def google_login(user : UserGoogleSignIn, db : Session =  Depends(get_db)):
    db_user = db.query(User).filter(user.google_id == User.google_id).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="User not found")
    
    
    profile_path = ''
    if db_user.profile_path != None and db_user.profile_path != '':
        profile_path = get_presigned_url(db_user.profile_path)
    token = create_access_token(data={"sub": str(db_user.id), "email" : str(db_user.email), "username" : str(db_user.username), "profilePath" : str(profile_path)})

    return {'message' : 'user found', 'token' : token, 'success' : True}

@app.get("/folder-path/{folder_id}")
def get_folder_path(folder_id: UUID, user_id: UUID=Depends(get_current_user_id), db: Session = Depends(get_db)):
    path = []
    current = db.query(Folder).filter(Folder.folder_id == folder_id, Folder.user_id == user_id).first()
    while current:
        path.insert(0, {"name": current.folder_name, "id": str(current.folder_id)})
        if not current.parent_id or current.parent_id == current.folder_id:
            break
        current = db.query(Folder).filter(Folder.folder_id == current.parent_id, Folder.user_id == user_id).first()
    return {"path": path}

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
    
    presigned_url = ''
    if db_user.profile_path != '' and db_user.profile_path != None:
        presigned_url = get_presigned_url(db_user.profile_path)
    print("presigned url; ", presigned_url)
    token = create_access_token(data={"sub": str(db_user.id), "email" : str(db_user.email), "username" : str(db_user.username), "profilePath" : presigned_url})
    print("Token created: ", token)

    return {"username": db_user.username, "token": token}


@app.post("/api/chrome/login")
def chrome_login(user: UserSignIn,  request: Request, db: Session = Depends(get_db)):
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
   
@app.get("/user/folder")
def get_folders( user_id: UUID=Depends(get_current_user_id), db:Session = Depends(get_db)):

   #come back
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
    

    
@app.get("/user/folder/{folder_id}")
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

@app.post("/users/folder/add")
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
    

    #  folderId: folder.folder_id,
    #       contentId: content_id,



@app.get("/users/folders")
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

    


@app.post("/user/folder/create")
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




@app.get("/search", response_model=list[ContentWithSummary])
def search(query: str, user_id: UUID = Depends(get_current_user_id),db: Session = Depends(get_db)):
    preprocessor = QueryPreprocessor()
    parsed_query = preprocessor.preprocess_query(query)

    manager = ContentEmbeddingManager(db)
    results = manager.query_similar_content(
        query=parsed_query,
        user_id=user_id,
    )

    print(f"Search results for query '{query}': {len(results)} results found.\n results: {results}")

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

@app.get("/auth/google")
def handle_google_session():

    try:

        print("google redirect uri ", GOOGLE_REDIRECT_URI )
        print("google client id: ", GOOGLE_CLIENT_ID)
        print("google client secret: ", GOOGLE_CLIENT_SECRET)
        params = {
            "client_id": GOOGLE_CLIENT_ID,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "consent"
        }
        google_auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
        return RedirectResponse(google_auth_url)
    
    except Exception as e:
        print("error occured in the backend: ", e)
        return 


@app.post("/auth/google/callback")
async def handle_google_callback(
    payload: dict, 
    request: Request,
    db: Session = Depends(get_db)
):
    code = payload.get('code')

    if not code:
        return JSONResponse({"error": "No code provided"}, status_code=400)

    # Exchange code for tokens
    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    }

    async with httpx.AsyncClient() as client:
        token_response = await client.post(token_url, data=token_data)
        token_json = token_response.json()
        access_token = token_json.get("access_token")

    if not access_token:
        return JSONResponse({"error": "No access token returned"}, status_code=400)

    # Get user info from Google
    async with httpx.AsyncClient() as client:
        user_info_response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        user_info = user_info_response.json()

    print("User Info:", user_info)


    google_user_id = user_info.get("id") 

    if not google_user_id:
        return JSONResponse({"error": "Invalid user info"}, status_code=400)

    user = db.query(User).filter(User.google_id == google_user_id).first()

    if not user:
        return JSONResponse({"error": "User not found"}, status_code=404)

    presigned_url = ""
    if user.profile_path:
        presigned_url = get_presigned_url(user.profile_path)

    # Generate token
    token = create_access_token(data={
        "sub": str(user.id),
        "email": user.email,
        "username": user.username,
        "profilePath": presigned_url
    })

    # Redirect to Chrome Extension with token
    return  {"token": token}







# @app.post("/content/save", response_model=ContentWithSummary)
@app.post("/content/save")
def save_content(content: ContentCreate, user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):
    print("entered the function")
    notes = content.notes

    print("content logs: ", content)

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    
    try:
        user_id = user.id
        print("User ID: ", user_id)

        existing_content = db.query(Content).filter(Content.url == content.url).first()

        utc_time = datetime.now(timezone.utc)

        print("utc value: ", utc_time)


        if not existing_content:
            new_content = Content(
                url=content.url,
                title=content.title,
                source="chrome_extension",
                user_id=user_id,
                first_saved_at=utc_time,
                read=False
            )
            db.add(new_content)
            db.flush()  # generate content_id without commit

            # Generate embedding only for new content
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

        # Check if this user already saved this content
        existing_item = db.query(ContentItem).filter(
            ContentItem.user_id == user_id,
            ContentItem.content_id == new_content.content_id
        ).first()

        print("current utc timezone: ", datetime.now(timezone.utc))

        utc_time = datetime.now(timezone.utc)

        if not existing_item:
            new_item = ContentItem(
                user_id=user_id,
                content_id=new_content.content_id,
                saved_at=utc_time,  
                notes=notes 
            )
            db.add(new_item)
            db.commit()

            saved_item = db.query(ContentItem).order_by(ContentItem.saved_at.desc()).first()
            print(f"Retrieved from DB: {saved_item.saved_at}")
            print(f"Retrieved type: {type(saved_item.saved_at)}")

            #add to the corresponding folder if any 

            if content.folder_id and content.folder_id != '' and content.folder_id != 'default':

                new_item = folder_item(
                    folder_item_id = uuid4(), 
                    folder_id = content.folder_id,
                    user_id = user_id, 
                    content_id = new_content.content_id,
                    added_at = datetime.utcnow()

                )

                db.add(new_item)
                db.commit()
                db.refresh(new_item)
            else:
                print("no valud fodler id found so skipping this part")
            

        print("Successfully saved content for user.")

        return {"status": "Success"}

    except Exception as e:
        print("error occured in saving the bookmark: ", str(e))
        return {'status': "unsucessful", 'error': str(e)}


@app.post("/api/user/google")
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

@app.post("/content/tab")
def tab_user_content(content: TabRemover,user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):

    try:
        content_id = content.content_id

        query = db.query(Content).filter(
            Content.content_id == content_id
        )

        DBcontent = query.one_or_none()

        if not DBContent:
            raise HTTPException(
            status_code=400,
            detail="Content not found in the Contents table"
        )


        existing_item = db.query(ContentItem).filter(
            ContentItem.user_id == user_id,
            ContentItem.content_id == DBcontent.content_id
        ).first()

        utc_time = datetime.now(timezone.utc)

        if not existing_item:
            new_item = ContentItem(
                user_id=user_id,
                content_id=DBcontent.content_id,
                saved_at=utc_time,  
                notes='' 
            )
            db.add(new_item)
            db.commit()

        return {'success' : True}
    
    except Exception as e:
        print("error in the backend: ", e)
        return {'success': False}


    





@app.post("/content/untab")
def untab_user_content(content: TabRemover,user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):
    #remove based on user_id and content_id
    content_id_to_delete = content.content_id

    # Construct the query to find the specific ContentItem to delete
    query = db.query(ContentItem).filter(
        ContentItem.user_id == user_id,
        ContentItem.content_id == content_id_to_delete
    )


    deleted_row_count = query.delete(synchronize_session='fetch')

    if deleted_row_count == 0:
     
        raise HTTPException(
            status_code=400,
            detail="Content item not found for the specified user and content ID."
        )

    db.commit()

    return {
        "message": "Content item successfully untabbed (deleted).",
        "user_id": user_id,
        "content_id": content_id_to_delete,
        "deleted_count": deleted_row_count
    }


@app.get("/user/profile/info")
def get_user_info(user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    print("user: ", user)

    return {
        
        "username": user.username,
        "email": user.email,
        "profilePath" : get_presigned_url( user.profile_path) if user.profile_path != '' else ''
  
    }




@app.post("/settings/update")
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


@app.get("/user/content/unread",response_model=list[UserSavedContent] )
def get_unread_content(user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):

    results = (
        db.query(ContentItem, Content, ContentAI.ai_summary)
        .join(Content, ContentItem.content_id == Content.content_id)
        .outerjoin(ContentAI, Content.content_id == ContentAI.content_id)
        .filter(ContentItem.user_id == user_id, Content.read == False)
        .order_by(desc(ContentItem.saved_at)) 
        .all()
    )



    response = [
        UserSavedContent(
            content_id=content.content_id,
            url=content.url,
            title=content.title,
            source=content.source,
            ai_summary=ai_summary,
            first_saved_at=item.saved_at,
            notes=item.notes
        )
        for item, content, ai_summary in results
    ]

    return response



@app.post("/user/content/{content_id}")
def update_read(content_id: UUID, user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):
    content = db.query(Content).filter(Content.content_id == content_id, Content.user_id == user_id).first()

    if not content:
        raise HTTPException(status_code=404, detail="Content not found or not owned by user")
    
    content.read = True
    db.commit()
    db.refresh(content)  # optional, but good practice if you'll return updated data

    return {"success": True}



  


# gets all content for a specific user 
@app.get("/content", response_model=list[UserSavedContent])
def get_user_content(user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):


    
    results = (
        db.query(ContentItem, Content, ContentAI.ai_summary)
        .join(Content, ContentItem.content_id == Content.content_id)
        .outerjoin(ContentAI, Content.content_id == ContentAI.content_id)
        .filter(ContentItem.user_id == user_id)
        .order_by(desc(ContentItem.saved_at)) 
        .all()
    )



    response = [
        UserSavedContent(
            content_id=content.content_id,
            url=content.url,
            title=content.title,
            source=content.source,
            ai_summary=ai_summary,
            first_saved_at=item.saved_at,
            notes=item.notes
        )
        for item, content, ai_summary in results
    ]

    return response



@app.post("/content/update/notes")
def updatenote(data: NoteContentUpdate, user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):
    previous_note = db.query(ContentItem).filter(ContentItem.content_id == data.bookmarkID).first()

    if not previous_note:
        raise HTTPException(status_code=404, detail="Content item not found")

    
    previous_note.notes = data.notes

    # Commit the change
    db.commit()

    return {"message": "Note updated successfully", "bookmarkID": str(data.bookmarkID)}

# gets a single piece of content for a specific user
@app.get("/content/{content_id}", response_model=ContentWithSummary)
def get_piece_content(content_id: UUID, user_id: UUID = Query(...), db: Session = Depends(get_db)):
    content = db.query(Content).filter(Content.content_id == content_id, Content.user_id == user_id).first()

    if not content:
        raise HTTPException(status_code=404, detail="Content not found for this user")
    return content


@app.delete("/content/{content_id}", status_code=204)
def delete_content(content_id: UUID, user_id: UUID, db: Session=Depends(get_db)):
    content = db.query(Content).filter(Content.content_id == content_id, Content.user_id == user_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found or not owned by user")

    db.delete(content)
    db.commit()
    return





if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.api.main:app", host="0.0.0.0", port=port)



