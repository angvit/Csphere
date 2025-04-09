from sqlalchemy import Column, String, ARRAY, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, Vector
from app.db.database import Base

class ContentAI(Base):
    __tablename__ = "content_ai"

    content_id = Column(UUID(as_uuid=True), ForeignKey("content.content_id"), primary_key=True)
    ai_summary = Column(String, nullable=True)
    embedding = Column(Vector(dim=384), nullable=True)
