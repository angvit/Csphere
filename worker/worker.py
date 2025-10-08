import os
import re
import json
import requests

from openai import OpenAI
from uuid import UUID
from bs4 import BeautifulSoup
from readability import Document
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from sqlalchemy import select
from uuid import uuid4
from datetime import datetime, timezone
import logging

from .data_models.content import Content
from .data_models.content_ai import ContentAI
from .data_models.category import Category
from .data_models.content_item import ContentItem
from .data_models.folder_item import folder_item

from classes import iab


from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

#Logging config stuff
logging.basicConfig(filename="csphere-logs.log",
                    format='%(asctime)s %(message)s',
                    filemode='w')

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)


load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
logging.info()

try:
    engine = create_engine(DATABASE_URL, connect_args={
        "options": "-c timezone=UTC"
    })
    logging.info("Database connection established with engine ")
except Exception as e:
    logging.error(f"Connection falied: {e}")

# managing transactions and DB state
SessionLocal = sessionmaker(bind=engine)

#Initialize the base for all datamodels -> same as the data models in the backend server 
Base = declarative_base()

# yield a fresh session per request (FASTAPI)
def get_db():
    logging.info('Creating new DB session')
    # session instance
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()




class ContentEmbeddingManager:
    '''
    Manages:
        - Generating vector embeddings for content summaries
        - Inserting and retrieving content and their embeddings from the db
        - Enriching raw HTML content for a summarization model
        - Performing similarity queries on content embeddings
        - Handling database interactions for both `Content` and `ContentAI` models
    '''

    def __init__(self, db, embedding_model_name='text-embedding-3-small', summary_model_name='gpt-3.5-turbo', content_url : str = ''):
        self.db = db
        self.embedding_model = embedding_model_name
        self.embedding_model_name = embedding_model_name
        self.summary_model = summary_model_name
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

        
        self.categorizer = iab.SolrQueryIAB(file_path="dummy.txt", file_url=content_url)

        self.ai_summary = ''




    ###############################################################################
    # METHODS
    ###############################################################################

    #

    # content_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    # url = Column(String, unique=True, nullable=False)   
    # title = Column(String, nullable=True)
    # source = Column(String, nullable=True)
    # first_saved_at = Column(TIMESTAMP(timezone=True), default=func.now())
    # read = Column(Boolean, nullable=False, server_default=text('false'))
    # content_ai = relationship("ContentAI", backref="content", uselist=False)

    #Note: Save contentAi directly to DB here 
    def process_content(self, content : Content, raw_html) -> None:
        '''
        Inserts content into the database if it doesn't exist, summarizes it, and embeds the summary
        If any exceptions occur, the transaction will be rolled back
        '''
        try:
            if self._content_ai_exists(content.content_id):
                return None

            # Enrich the content by parsing the raw_html. If getting the html fails, default the summary_input to title
            #add in raw html to the enrich content function 
            summary_input = self._enrich_content(content.url, content.content_id, self.db, raw_html)
            if not summary_input:
                summary_input = content.title or "No title avaliable"


            # Use LLM to summarize the content
            summary = self._summarize_content(summary_input) 

            self._store_article_summary_pair(
                article_text= summary_input,
                summary= summary,
                url= content.url,
                title= content.title
            )

            
            if not summary: 
                raise Exception("Failed to summarize content and/or there is no title")
            
            self.ai_summary = summary
            
            print("generating categories: ")
            categories = self.generateCategories()

            print("categories returned: ", categories)


            #Now create categories that are not yet in the DB
            category_set = set()
            db = self.db
            for tag, cat_list in categories.items():
                # get the first element's name from the list of tuples

                category_name = cat_list[0][0]
                if category_name.strip() != '':

                    exists = db.query(Category).filter(Category.category_name == category_name).first()

                    if exists:
                        category_set.add(exists.category_id)
                        continue

                    utc_time = datetime.now(timezone.utc)

                    new_category = Category(
                        category_id=uuid4(),
                        category_name=category_name,
                        created_at=utc_time,
                        date_modified=utc_time
                    )

                    db.add(new_category)
                    category_set.add(new_category.category_id)

            db.flush()

            #add them to the corresponding content object

            content.categories = db.query(Category).filter(Category.category_id.in_(category_set)).all()





            # Embed the summary associated with the content ORM
            embedding = self._generate_embedding(summary)
            if not embedding: 
                raise Exception("Failed to generate embedding") 

            # Insert the summary/embedding data into the ContentAI table
            content_ai = ContentAI(
                content_id=content.content_id,
                ai_summary=summary,
                embedding=embedding
            )

            self.db.add(content_ai)
            self.db.commit()

            #start from here
            return content_ai
        
        
        except Exception as e:
            self.db.rollback()
            print(f"[ContentEmbeddingManager] failed to process content: {e}")
            return None
        

    def query_similar_content(self, query, user_id:UUID, start_date=None,end_date=None, limit=5):
        ''' Generates a query embedding and vector search the db for related content '''
        
        query_embedding = self.openai_client.embeddings.create(
            model=self.embedding_model,
            input=query["semantic_query"]
        ).data[0].embedding

        results = (
            self.db.query(ContentAI, Content)
            .join(Content, ContentAI.content_id == Content.content_id)
            .filter(Content.user_id == user_id)
        )

        if start_date and end_date:
            results = results.filter(Content.first_saved_at.between(start_date, end_date))

        results = (
            results.order_by(ContentAI.embedding.l2_distance(query_embedding))
            .limit(limit)
            .all()
        )

        return results


    ###############################################################################
    # HELPER METHODS
    ###############################################################################


    def generateCategories(self):
        self.categorizer.setAiSummary(ai_summary=self.ai_summary)
        self.categorizer.index_data()
        categories_dic = self.categorizer.get_categories()

        return categories_dic

    def _store_article_summary_pair(self, article_text, summary, url, title):
        record = {
            "url": url,
            "title": title,
            "article": article_text,
            "summary": summary
        }

        try:
            with open("../data/summaries.json", "r") as f:
                data = json.load(f)
                data.append(record)
                f.seek(0)
                json.dump(data, f)
        except Exception as e:
            print(f"Failed to write with error: {e}")
    

    def _enrich_content(self, url: str, content_id: UUID, db: Session, raw_html):
        try:
           
            # print("extracting raw html from : ", raw_html[:20])
            metadata = self._extract_metadata_and_body(raw_html)
            metadata["body_text"] = self._clean_text(metadata["body_text"])

            summary_input = self._build_summary_input(metadata)
            return summary_input    

        except Exception as e:
            print(f"Error enriching content from {url}: {e}")
            return None


    def _generate_embedding(self, text):
        try:
            response = self.openai_client.embeddings.create(
                model=self.embedding_model,
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"OpenAI embedding failed: {e}")
            return None
        

    def _content_ai_exists(self, content_id: UUID) -> bool:
        return self.db.query(ContentAI).filter_by(content_id=content_id).first() is not None


    def _clean_text(self, text:str, max_chars=1000) -> str:    
        lines = text.split("\n")
        cleaned = []

        for line in lines:
            line = line.strip()
            if not line or re.search(r"(©|\ball rights\b|cookie|advertisement)", line, re.I):
                continue
            cleaned.append(line)

        joined = " ".join(cleaned)
        return joined[:max_chars]
            

    def _extract_metadata_and_body(self, html: str) -> dict:
        soup = BeautifulSoup(html, "html.parser")
        
        title = soup.title.string.strip() if soup.title else ""
        description = ""
        tags = []

        for meta in soup.find_all("meta"):
            if meta.get("name") == "description":
                description = meta.get("content", "")
            if meta.get("property") == "og:description":
                description = meta.get("content", "") or description
            if meta.get("name") == "keywords":
                tags = [tag.strip() for tag in meta.get("content", "").split(",")]

        doc = Document(html)
        # html snippet of main content body with boilerplate (nav bars, ads, footers) removed
        body = BeautifulSoup(doc.summary(), "html.parser").get_text()


        return {
            "title": title,
            "description": description,
            "tags": tags,   
            "body_text": body.strip()
        }


    def _build_summary_input(self, metadata: dict) -> str:
        input_parts = []

        if metadata["title"]:
            input_parts.append(f"Title: {metadata['title']}")
        if metadata["description"]:
            input_parts.append(f"Description: {metadata['description']}")
        if metadata["tags"]:
            input_parts.append(f"Tags: {', '.join(metadata['tags'])}")
        if metadata["body_text"]:
            input_parts.append(f"Content:\n\n{metadata['body_text']}")
        
        # snippet = metadata["body_text"][:500]
        # input_parts.append(f"Content Snippet: {snippet}")
        return "\n".join(input_parts)


    def _insert_db(self, Data_Model, data):
        '''
        Takes a data model ORM and inserts data into that table
        Returns that db object data
        '''
        try:
            db_data = Data_Model(**data)
            self.db.add(db_data)
            self.db.flush()     # Flush for content_ai insertion
            return db_data
        except SQLAlchemyError as e:
            self.db.rollback()
            print(f"Error Inserting into {Data_Model.__tablename__}: {e}")
            return None


    def _url_exists(self, url):
        ''' Checks if a URL already exists in the database '''
        if url:
            existing_content = self.db.scalar(select(Content).where(Content.url == url))
            if existing_content:
                print(f"Content with URL '{url}' already exists. Skipping insertion.")
                return existing_content  
        return False
    
    
    def _summarize_content(self, summary_input):
        try:
            response = self.openai_client.chat.completions.create(
                model=self.summary_model,
                messages=[
                    {
                        "role": "system", 
                         "content": (
                             "Summarize the following webpage content in 2-3 sentences"
                            # "As a concise technical summarizer, your task is to generate a summary of the article in exactly two short sentences. "
                            # "Use the following process to ensure accuracy and relevance:\n\n"
                            # "1. Identify the main topic of the article.\n"
                            # "2. Extract any key details related to this main topic.\n"
                            # "3. Construct a two-sentence summary encompassing the main topic and key details.\n\n"
                            # "Keep the focus on the main point by disregarding ads, disclaimers, and unrelated text in the article. "
                            # "Make sure to keep a neutral tone throughout the summary."
                    )
                    },
                    {"role": "user", "content": summary_input},
                ],
                temperature=0.6,
                max_tokens=150,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"OpenAI summarization failed: {e}")
            return None



if __name__ == '__main__':
    #pull from active MQ : 

    message = {
        "content_payload": {
            "url": "https://www.nationalgeographic.com/travel/article/best-places-to-visit-2025",
            "title": "The Best Places to Visit in 2025",
            "source": "chrome_extension",
            "user_id": "user_12345",
            "first_saved_at": "2025-10-08T20:12:45Z",
            "read": False
        },
        "raw_html": """
            <html>
                <head><title>The Best Places to Visit in 2025</title></head>
                <body>
                    <h1>Top Destinations for 2025</h1>
                    <p>From Japan’s cherry blossoms to the fjords of Norway, these are the most anticipated travel spots for the year.</p>
                </body>
            </html>
        """,
        "user_id": "user_12345",
        "notes": "Highlight section about Japan and Norway for next trip planning."
    }

    db = get_db() # get the DB connection 


            # payload = {
            #     "content_payload": {
            #         'url': content.url,
            #         'title': content.title, 
            #         'source': "chrome_extension", 
            #         'user_id': user_id, 
            #         'first_saved_at' : utc_time,
            #         'read': False 
            #     },
            #     'raw_html': content.html
            #     'user_id' : user_id
            #     'notes' : notes
            # }


    #Create the Content object 
    user_id = message.get('user_id')
    notes = message.get('notes')
    folder_id = message.get('folder_id', '')
    content_data = json.loads(message.get('content_payload', {}))
    new_content = Content(**content_data)
    
    try:
        db.add(new_content)
        db.flush()
        content_manager = ContentEmbeddingManager(db=db, content_url=new_content.url)

        raw_html = message.get('raw_html', '')

        if raw_html == '':
            logging.info("No raw html provided, categorization and summarization may be poor")

        content_ai = content_manager.process_content(new_content, raw_html)

        db.commit()

        if not content_ai:
            logging.info("Embedding generation failed or skipped.")
        else:
            logging.debug(f"Summary Generated: {content_ai.ai_summary}")

            # Check if this user already saved this content
            existing_item = db.query(ContentItem).filter(
                ContentItem.user_id == user_id,
                ContentItem.content_id == new_content.content_id
            ).first()


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

                # Add to the corresponding folder if any
                if folder_id and folder_id != '' and folder_id != 'default':
                    new_folder_item = folder_item(
                        folder_item_id=uuid4(),
                        folder_id=folder_id,
                        user_id=user_id,
                        content_id=new_content.content_id,
                        added_at=datetime.utcnow()
                    )

                    db.add(new_folder_item)
                    db.commit()
                    db.refresh(new_folder_item)
                else:
                    print("No valid folder id found, skipping this part")

            logging.info("Successfully saved content for user.")

    except Exception as e:
        logging.error(f"Error occurred while saving the bookmark: {str(e)}")
