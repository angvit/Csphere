from sqlalchemy import Column, String, TIMESTAMP, ForeignKey
from sqlalchemy import text
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base
import uuid

class Content(Base):
    __tablename__ = "content"

    content_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    url = Column(String, unique=True, nullable=False)   
    title = Column(String, nullable=True)
    source = Column(String, nullable=True)
    first_saved_at = Column(TIMESTAMP(timezone=True), server_default=text("NOW()"))