from sentence_transformers import SentenceTransformer
from app.data_models.content_ai import ContentAI
from app.data_models.content import Content
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from transformers import pipeline
from readability import Document
from bs4 import BeautifulSoup
from sqlalchemy import select
from uuid import UUID
import requests
import re


class ContentEmbeddingManager:
    '''
    Manages:
        - Generating vector embeddings for content summaries
        - Inserting and retrieving content and their embeddings from the db
        - Enriching raw HTML content for a summarization model
        - Performing similarity queries on content embeddings
        - Handling database interactions for both `Content` and `ContentAI` models
    '''

    def __init__(
            self, 
            db, 
            embedding_model_name='sentence-transformers/all-MiniLM-L6-v2', 
            summary_model_name='google/flan-t5-small' # We can always change the model
    ):
        self.db = db
        self.embedding_model = SentenceTransformer(embedding_model_name)
        # self.summary_model = pipeline("summarization", model=summary_model_name)
        self.summary_model = pipeline(
            "text2text-generation",
            model=summary_model_name,
            tokenizer=summary_model_name,
            device_map="auto",
        )


    ###############################################################################
    # METHODS
    ###############################################################################

    def query_similar_content(self, query, user_id:UUID, start_date=None,end_date=None, limit=3):
        ''' Generates a query embedding and searches the db for related content '''
        
        query_embedding = self.embedding_model.encode(query) 

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


    def insert_embedded_content(self, content_data):
        '''
        Inserts content into the database if it doesn't exist, summarizes it, and embeds the summary
        If any exceptions occur, the transaction will be rolled back
        '''
        try:

            # Check if the url exists in the db already
            url = content_data.get("url")
            if self._url_exists(url):
                return None, None
            
            # Add content data to the db
            content = self._insert_db(Content, content_data)
            if content is None: 
                raise Exception("Failed to insert content into the database")

            # Enrich the content by parsing the raw_html. If getting the html fails, default the summary_input to title
            summary_input = self._enrich_content(url, content.content_id, self.db)
            if summary_input is None:
                summary_input = content_data.get("title")

            # Use an LLM to summarize the content. If this fails, default to the title for the summary
            ai_summary = self._summarize_content(summary_input) 
            summary = ai_summary if ai_summary else summary_input
            if summary is None: 
                raise Exception("Failed to summarize content and/or there is no title")

            # Embed the summary associated with the content ORM
            embedding = self.generate_embedding(summary)
            if embedding is None: 
                raise Exception("Failed to generate embedding") 

            # Insert the embedding data into the db
            content_ai_data = {
                "content_id": content.content_id, 
                "ai_summary": summary, 
                "embedding": embedding
            }
            content_ai = self._insert_db(ContentAI, content_ai_data)
            if content_ai is None: 
                raise Exception("Failed to insert embedding data") 
            
            # If all steps succeed, then commit transaction to db
            self.db.commit()

            print(
                f"Created Content ID: {content.content_id},\n"
                f"Content AI ID: {content_ai.content_id},\n"
                f"Embedding (first 10): {content_ai.embedding[:10]},\n"
                f"Summary that was embedded {summary}\n\n"
            )

            return content, content_ai
        
        except (SQLAlchemyError, Exception) as e:
            self.db.rollback()
            print(f"Error occured in the insert_embedded_content function. Nothing commited to database: {e}")
            return None, None


    def generate_embedding(self, text):
        ''' Generates an embedding for a piece of text using a Sentence Transformer embedding model '''

        try:
            return self.embedding_model.encode(text)
        except Exception as e: 
            print(f"An unexpected error occurred during embedding: {e}")
            return None


    ###############################################################################
    # HELPER METHODS
    ###############################################################################

    def _fetch_html(self, url: str) -> str:
        resp = requests.get(url, timeout=5)
        return resp.text if resp.status_code == 200 else ""
    

    def _clean_body(self, text:str, max_chars=1000):    
        lines = text.split("\n")
        cleaned = []

        for line in lines:
            line = line.strip()
            if not line: 
                continue
            if re.search(r"(©|\ball rights\b|cookie|advertisement)", line, re.I):
                continue
            cleaned.append(line)
        joined = " ".join(cleaned)
        return joined[:max_chars]
    

    def _enrich_content(self, url: str, content_id: UUID, db: Session):
        response = requests.get(url, timeout=5)
        if response.status_code != 200:
            print(f"Error: {response.status_code}: failed get request for {url}, defaulting to title for summarization input")
            return None
        
        raw_html = self._fetch_html(url)
        metadata = self._extract_metadata_and_body(raw_html)
        metadata["body_text"] = self._clean_body(metadata["body_text"])

        summary_input = self._build_summary_input(metadata)

        print(f"THE SUMMARY INPUT AFTER ENRICHING IS = {summary_input}")

        return summary_input


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

        # We m
        print(f"The title from soup is: {title}")

        return {
            "title": title,
            "description": description,
            "tags": tags,
            "body_text": body.strip()
        }


    def _build_summary_input(self, metadata: dict) -> str:
        input_parts = [
            "Summarize the following article in **two sentences** for a technical reader. "
            "Focus on the core idea; ignore boilerplate like copyright notices or ads.\n"
        ]
        # input_parts = []

        if metadata["title"]:
            input_parts.append(f"Title: {metadata["title"]}")
        if metadata["description"]:
            input_parts.append(f"Description: {metadata["description"]}")
        if metadata["tags"]:
            input_parts.append(f"Tags: {", ".join(metadata["tags"])}")
        if metadata["body_text"]:
            input_parts.append(f"Content:\n{metadata['body_text']}")
        
        '''
        Content snippet seems to be messing up the summarizer
        The content may not be relavant 
        Example:
            for https://www.lancasterpuppies.com/puppy-search/state/NY?sortBy=prod_all_listings
            Content snippet is copyright info
            and the summary that gets embeeded is: site logo, Web Layout, and all pictures and text are copyright 2014-2024 by PMG US, LLC.
        Commenting put the content snippet seems to help
        '''
        # snippet = metadata["body_text"][:500]
        # input_parts.append(f"Content Snippet: {snippet}")
        print("\n".join(input_parts))
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
        ''' Uses a summary model to get a more detailed summary for the content embeddings '''
        
        # Debug (TO REMOVE)
        print(f"The summary input being passed to summary model is: {summary_input}")

        # Check if there is input first
        if summary_input is None:
            return None

        try:
            input_length = len(self.embedding_model.tokenizer.encode(summary_input)) # Get actual token length
            max_length = int(input_length * 0.6)  # Set the max length to about 60 % of input (we can change)
            max_length = max(30, min(max_length, 150)) # Ensure the max length is within a reasonable range
            summary = self.summary_model(
                summary_input, 
                max_length=max_length, 
                num_beams=4,
                no_repeat_ngram_size=3,
                repetition_penalty=2.0,
                early_stopping=True,
                min_length=15, 
                do_sample=False
            )[0]['summary_text']
            return summary
        
        except Exception as e:
            print(f"An error occurred during summarization: {e}")
            return None