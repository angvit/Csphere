import requests
from sqlalchemy.orm import Session
from readability import Document
from bs4 import BeautifulSoup
from app.semantic_search.embed import embed_text
from app.data_models.content_ai import ContentAI
from uuid import UUID


def extract_metadata_and_body(html: str) -> dict:
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

    readable_doc = Document(html)
    # html snippet of main content body with boilerplate (nav bars, ads, footers) removed
    body_html = readable_doc.summary() 
    body_text = BeautifulSoup(body_html, "html.parser").get_text()

    return {
        "title": title,
        "description": description,
        "tags": tags,
        "body_text": body_text.strip()
    }


def build_summary_input(metadata: dict) -> str:
    input_parts = []

    if metadata["title"]:
        input_parts.append(f"Title: {metadata["title"]}")
    if metadata["description"]:
        input_parts.append(f"Description: {metadata["description"]}")
    if metadata["tags"]:
        input_parts.append(f"Tags: {", ".join(metadata["tags"])}")
    
    snippet = metadata["body_text"][:500]
    input_parts.append(f"Content Snippet: {snippet}")

    return "\n".join(input_parts)


def summarize_content(text: str):
    pass


def enrich_content(url: str, content_id: UUID, db: Session):
    response = requests.get(url, timeout=5)
    if response.status_code != 200:
        print("Error: ", response.status_code)
        return
    
    raw_html = response.text
    metadata = extract_metadata_and_body(raw_html)
    summary_input = build_summary_input(metadata)

    summary = summarize_content(summary_input)
    embedding = embed_text(summary) 

    content_ai = ContentAI(
        content_id = content_id,
        ai_summary = summary,
        embedding = embedding
    )

    db.add(content_ai)
    db.commit()