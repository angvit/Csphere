from sqlalchemy import Column, String, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid)
    email = Column(String, unique=True, nullable=False)
    created_at = Column(TIMESTAMP, server_default="NOW()")