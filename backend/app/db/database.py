import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
try:
    engine = create_engine(DATABASE_URL)
    print("Connected")
except Exception as e:
    print("Connection falied: ", e)

# managing transactions and DB state
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()

# yield a fresh session per request (FASTAPI)
def get_db():
    # session instance
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

