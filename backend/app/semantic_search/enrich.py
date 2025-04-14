import requests
from sqlalchemy.orm import Session
from bs4 import BeautifulSoup
from app.semantic_search.embed import embed_text
from app.data_models.content_ai import ContentAI
from uuid import UUID


def extract_text_from_html(html: str):
    soup = BeautifulSoup(html, "html.parser")
    paragraphs = soup.find_all("p")
    return " ".join([p.get_text() for p in paragraphs])


def summarize_content(text: str):
    pass

def enrich_content(url: str, content_id: UUID, db: Session):
    response = requests.get(url, timeout=5)
    if response.status_code != 200:
        print("Error: ", response.status_code)
        return
    
    raw_html = response.text
    text = extract_text_from_html(raw_html)
    summary = summarize_content(text)
    embedding = embed_text(summary) 

    content_ai = ContentAI(
        content_id = content_id,
        ai_summary = summary,
        embedding = embedding
    )

    db.add(content_ai)
    db.commit()