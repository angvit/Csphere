from sqlalchemy import Column, String, TIMESTAMP, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy import text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func


from app.db.database import Base
import uuid


class CategoryCategory(Base):
    __tablename__='content_category'

    category_content_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_id = Column(UUID(as_uuid=True), ForeignKey("content.content_id"), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("category.category_id"), nullable=False)
   