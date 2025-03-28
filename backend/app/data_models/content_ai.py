from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base

class ContentAI(Base):
    __tablename__ = "content_ai"

    content_id = Column(UUID(as_uuid=True), ForeignKey("content.content_id"))
    ai_summary = Column(String, nullable=True)
    embedding = Column(String, nullable=True) # pgvector integration may need different type