from sqlalchemy import Column, String, TIMESTAMP, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base
import uuid

class Content(Base):
    __tablename__ = "content"

    content_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    url = Column(String, unique=True, nullable=False)   
    title = Column(String, nullable=True)
    source = Column(String, nullable=True)
    first_saved_at = Column(TIMESTAMP, Text(server_default="NOW()"))