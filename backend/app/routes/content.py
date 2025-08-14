from fastapi import APIRouter, Depends, HTTPException, Query
from app.db.database import get_db
from app.data_models.content import Content
from app.data_models.content_item import ContentItem
from app.data_models.content_ai import ContentAI
from app.data_models.folder_item import folder_item
from app.data_models.folder import Folder
from app.schemas.content import ContentCreate, ContentWithSummary, UserSavedContent, DBContent, TabRemover, NoteContentUpdate, UserSavedContentResponse, CategoryOut
from app.preprocessing.preprocessor import QueryPreprocessor
from app.embeddings.content_embedding_manager import ContentEmbeddingManager
from app.data_models.user import User
from datetime import datetime, timezone
from uuid import uuid4
import logging
from sqlalchemy.orm import joinedload

from app.utils.hashing import get_current_user_id
from sqlalchemy.orm import Session
from uuid import UUID
from sqlalchemy import desc

router = APIRouter(
    # prefix="/content"
)

logger = logging.getLogger(__name__) 



@router.get("/content/search", response_model=UserSavedContentResponse)
def search(query: str, user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):
    preprocessor = QueryPreprocessor()
    parsed_query = preprocessor.preprocess_query(query)

    manager = ContentEmbeddingManager(db)
    results = manager.query_similar_content(
        query=parsed_query,
        user_id=user_id,
    )


    bookmark_data = []

    for content_ai, content in results:
        bookmark_data.append(
            UserSavedContent(
                content_id=content_ai.content_id,
                title=content.title,
                url=content.url,
                source=content.source,
                first_saved_at=content.first_saved_at,
                ai_summary=content_ai.ai_summary,
                notes="", 
                tags=[]    
            )
        )

    return {
        "bookmarks": bookmark_data,
        "categories": []  # or `None`, depending on how you define Optional
    }







@router.post("/content/save")
def save_content(content: ContentCreate, user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):
    notes = content.notes

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    
    try:
        user_id = user.id

        existing_content = db.query(Content).filter(Content.url == content.url).first()

        utc_time = datetime.now(timezone.utc)



        if not existing_content:
            #create the new content
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
            print("generating manager")
            embedding_manager = ContentEmbeddingManager(db, content_url=content.url)
            print("done generating")
            raw_html = content.html
            content_ai = embedding_manager.process_content(new_content, raw_html)
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
                print("no valid fodler id found so skipping this part")
            

        print("Successfully saved content for user.")

        return {"status": "Success"}

    except Exception as e:
        print("error occured in saving the bookmark: ", str(e))
        return {'status': "unsucessful", 'error': str(e)}
    

@router.get("/content/unread/count")
def get_unread_count(user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):

    try:
        total_count = db.query(Content).filter(Content.user_id == user_id, Content.read == False).count()

        logger.debug(f"Total count fetched for user id {user_id} : {total_count}")
        return {'status' : "succesful", 'total_count' : total_count}


    except Exception as e:
        logger.error(f"Error occured in count api router: {e}")
        return {'status' : 'unsuccesfull', 'error' : str(e)}


@router.get("/content/unread", response_model=UserSavedContentResponse)
def get_unread_content(user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):

    results = (
        db.query(ContentItem, Content, ContentAI.ai_summary)
        .join(Content, ContentItem.content_id == Content.content_id)
        .outerjoin(ContentAI, Content.content_id == ContentAI.content_id)
        .options(joinedload(Content.categories))  # Eager load categories
        .filter(ContentItem.user_id == user_id, Content.read == False)
        .order_by(desc(ContentItem.saved_at))
        .all()
    )

    bookmark_data = []
    category_list = []

    for item, content, ai_summary in results:
        tags = [CategoryOut.from_orm(cat) for cat in content.categories]
        bookmark_data.append(
            UserSavedContent(
                content_id=content.content_id,
                url=content.url,
                title=content.title,
                source=content.source,
                ai_summary=ai_summary,
                first_saved_at=item.saved_at,
                notes=item.notes,
                tags=tags
            )
        )
        category_list.extend(tags)

    # Deduplicate categories by category_id
    unique_categories = {cat.category_id: cat for cat in category_list}.values()

    return {
        "bookmarks": bookmark_data,
        "categories": list(unique_categories)
    }



@router.get("/content", response_model=UserSavedContentResponse)
def get_user_content(user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):

    results = (
        db.query(ContentItem, Content, ContentAI.ai_summary)
        .join(Content, ContentItem.content_id == Content.content_id)
        .outerjoin(ContentAI, Content.content_id == ContentAI.content_id)
        .options(joinedload(Content.categories))  # Eager load categories
        .filter(ContentItem.user_id == user_id)
        .order_by(desc(ContentItem.saved_at)) 
        .all()
    )

    category_list = []
    bookmark_data = []

    for item, content, ai_summary in results:
        tags = [CategoryOut.from_orm(cat) for cat in content.categories]
        bookmark_data.append(
            UserSavedContent(
                content_id=content.content_id,
                url=content.url,
                title=content.title,
                source=content.source,
                ai_summary=ai_summary,
                first_saved_at=item.saved_at,
                notes=item.notes,
                tags=tags
            )
        )
        category_list.extend(tags)

    unique_categories = {cat.category_id: cat for cat in category_list}.values()

    return {
        "bookmarks": bookmark_data,
        "categories": list(unique_categories)
        
    }


@router.post("/content/update/notes")
def updatenote(data: NoteContentUpdate, user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):
    previous_note = db.query(ContentItem).filter(ContentItem.content_id == data.bookmarkID).first()

    if not previous_note:
        raise HTTPException(status_code=404, detail="Content item not found")

    
    previous_note.notes = data.notes

    # Commit the change
    db.commit()

    return {"message": "Note updated successfully", "bookmarkID": str(data.bookmarkID)}








@router.post("/content/tab")
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


    





@router.post("/content/untab")
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



@router.delete("/content/{content_id}", status_code=204)
def delete_content(content_id: UUID, user_id: UUID, db: Session=Depends(get_db)):
    content = db.query(Content).filter(Content.content_id == content_id, Content.user_id == user_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found or not owned by user")

    db.delete(content)
    db.commit()
    return



@router.post("/user/content/{content_id}")
def update_read(content_id: UUID, user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):
    content = db.query(Content).filter(Content.content_id == content_id, Content.user_id == user_id).first()

    if not content:
        raise HTTPException(status_code=404, detail="Content not found or not owned by user")
    
    content.read = True
    db.commit()
    db.refresh(content)  # optional, but good practice if you'll return updated data

    return {"success": True}


@router.get("/content/{content_id}", response_model=ContentWithSummary)
def get_piece_content(content_id: UUID, user_id: UUID = Query(...), db: Session = Depends(get_db)):
    content = db.query(Content).filter(Content.content_id == content_id, Content.user_id == user_id).first()

    if not content:
        raise HTTPException(status_code=404, detail="Content not found for this user")
    return content


@router.post("/content/recent", response_model=list[ContentWithSummary])
def get_recent_content(user_id: UUID = Depends(get_current_user_id), db: Session = Depends(get_db)):
    try:
        results = (
            db.query(Content, Folder)
            .join(ContentAI, ContentAI.content_id == Content.content_id)
            .outerjoin(folder_item, folder_item.content_id == Content.content_id)
            .outerjoin(Folder, folder_item.folder_id == Folder.folder_id)
            .filter(Content.user_id == user_id)
            .order_by(Content.first_saved_at.desc())
            .limit(10)
            .all()
        )


        response = []
        for content, folder in results:
            response.append(ContentWithSummary(
                content_id=content.content_id,
                title=content.title,
                url=content.url,
                source=content.source,
                first_saved_at=content.first_saved_at,
                ai_summary=content.content_ai.ai_summary if content.content_ai else None,
                folder = folder.folder_name if  folder and folder.folder_name else 'none'
            ))

        logger.info(f"Recent content for user id {user_id} being returned: {response}")

        return response

    except Exception as e:
        logger.error(f"Error occured in api endpoint '/content/recent' : {e}")
        return []  
