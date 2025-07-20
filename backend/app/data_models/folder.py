from sqlalchemy import Column, String, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base
from pydantic import BaseModel, EmailStr
from datetime import datetime
import uuid


class Folder(Base):
    __tablename__ = "folder"

    folder_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id",  ondelete="CASCADE"), nullable=False)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("folder.folder_id",  ondelete="CASCADE"), nullable=False)
    folder_name = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, server_default="NOW()")

