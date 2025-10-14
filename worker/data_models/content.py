from sqlalchemy import Column, String, TIMESTAMP, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy import text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from database import Base
import uuid
from data_models.content_category import ContentCategory
from data_models.category import Category


class Content(Base):
    __tablename__ = "content"

    content_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    url = Column(String, unique=True, nullable=False)   
    title = Column(String, nullable=True)
    source = Column(String, nullable=True)
    first_saved_at = Column(TIMESTAMP(timezone=True), default=func.now())
    read = Column(Boolean, nullable=False, server_default=text('false'))
    content_ai = relationship("ContentAI", backref="content", uselist=False)


    categories = relationship(
        "Category",                      
        secondary=ContentCategory,
        back_populates="contents"      
    )