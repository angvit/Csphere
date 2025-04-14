from sqlalchemy.orm import Session
from sqlalchemy import text
from app.data_models.content_ai import ContentAI
from app.semantic_search.embed import embed_text


def search_pgvector(query: str, db: Session, user_id, k=5):
    query_vector = embed_text(query)
    vector_str = str(query_vector).replace("[", "'[").replace("]", "']")

    sql = text("""
        SELECT content_id, ai_summary
        FROM content_ai
        ORDER BY embedding <-> vector_str::vector
        LIMIT k;
    """)

    result = db.execute(sql, {"query_vector": vector_str, "k": k}).fetchall()
