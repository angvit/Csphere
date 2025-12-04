from app.db.database import SessionLocal
from app.embeddings.embedding_manager import ContentEmbeddingManager
from app.data_models.user import User
import uuid
import requests

db = SessionLocal()
manager = ContentEmbeddingManager(db)

# Step 1: Ensure test user exists
test_email = "test2@example.com"
user = db.query(User).filter(User.email == test_email).first()

if not user:
    user = User(
        id=uuid.uuid4(),
        email=test_email,
        username="testuser",
        password="testpassword123"  
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    print(f" Created test user: {user.id}")
else:
    print(f" Found test user: {user.id}")

# Step 2: Insert test content
test_data = {
    "user_id": user.id,
    "url": "https://cs.stanford.edu/people/eroberts/courses/ww2/projects/jet-airplanes/how.html",
    "title": "How Jet Engines Work",
    "source": "Stanford University"
}

# Step 3: Insert and summarize
content, content_ai = manager.insert_embedded_content(test_data)

# Step 4: Output
if content_ai:
    print("\n Summary:", content_ai.ai_summary)
else:
    print("\n No summary generated.")


query = "Articles related to jet engines"
hits = requests.get(
    "http://localhost:8000/content/search",
    params={"user_id": user.id, "q": query}
).json()


print("Search results for:", query)
for h in hits:
    print(h)