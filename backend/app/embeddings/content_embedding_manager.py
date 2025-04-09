from sentence_transformers import SentenceTransformer
from app.data_models.content_ai import ContentAI
from app.data_models.content import Content
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select


class ContentEmbeddingManager:
    '''
    Manages content embeddings, database interactions, and similarity queries
    '''

    def __init__(self, db, model_name='sentence-transformers/all-MiniLM-L6-v2'):
        self.db = db
        self.model = SentenceTransformer(model_name)


    ###############################################################################
    # METHODS
    ###############################################################################

    def query_similar_content(self, query, limit=3):
        ''' Generates a query embedding and searches the db for related content '''
        
        query_embedding = self.model.encode(query) 

        results = (
            self.db.query(ContentAI, Content)
            .join(Content, ContentAI.content_id == Content.content_id)
            .order_by(ContentAI.embedding.l2_distance(query_embedding))
            .limit(limit)
            .all()
        )

        return results


    def insert_embedded_content(self, content_data, placeholder_sent):
        '''
        Inserts content into the database if it doesn't exist, summarizes it, and embeds the summary
        '''

        if self._url_exists(content_data.get("url")):
            return None, None
        
        # Add content data to the db
        content = self._insert_db(Content, content_data)
        if content is None: 
            return None, None

        # Use an LLM to summarize the content
        ai_summary = self._summarize_content(placeholder_sent) # REPLACE W/ content
        if ai_summary is None: 
            return None, None

        # Embed the summary associated with the content ORM
        embedding = self.generate_embedding(ai_summary)
        if embedding is None: 
            return None, None

        # Insert the embedding data into the db
        content_ai_data = {
            "content_id": content.content_id, 
            "ai_summary": ai_summary, 
            "embedding": embedding
        }
        content_ai = self._insert_db(ContentAI, content_ai_data)
        if content_ai is None: 
            return None, None

        print(
            f"Created Content ID: {content.content_id},\n"
            f"Content AI ID: {content_ai.content_id},\n"
            f"Embedding (first 10): {content_ai.embedding[:10]}\n\n"
        )

        return content, content_ai


    def generate_embedding(self, text):
        ''' Generates an embedding for a piece of text using a Sentence Transformer embedding model '''
        try:
            return self.model.encode(text)
        except Exception as e: 
            print(f"An unexpected error occurred during embedding: {e}")
            return None


    ###############################################################################
    # HELPER METHODS
    ###############################################################################

    def _insert_db(self, Data_Model, data):
        '''
        Takes a data model ORM and inserts data into that table
        Returns that db object data
        '''
        try:
            db_data = Data_Model(**data)
            self.db.add(db_data)
            self.db.commit()
            self.db.refresh(db_data)
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
    
    
    # TODO
    def _summarize_content(self, content):
        # Place holder for now
        return content # For now