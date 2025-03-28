from sqlalchemy import Column, ForeignKey, TIMESTAMP, String
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base

class ContentItem(Base):
    __tablename__ = "content_item"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    content_id = Column(UUID(as_uuid=True), ForeignKey("content.content_id"))
    saved_at = Column(TIMESTAMP, server_default="NOW()")
    notes = Column(String, nullable=True)