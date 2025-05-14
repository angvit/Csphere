from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from app.data_models.content import Content
from dotenv import load_dotenv
import json
import os 

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

contents = session.query(Content).limit(500).all()  # Adjust the limit as needed

exported_data = []
for content in contents:
    exported_data.append({
        "content_id": str(content.content_id),
        "url": content.url,
        "title": content.title,
        "body": content.raw_html  # Or clean parsed text if available
    })

with open("../data/exported_content.json", "w") as f:
    json.dump(exported_data, f, indent=4)

print("Export complete, data saved to ../data/exported_content.json")
