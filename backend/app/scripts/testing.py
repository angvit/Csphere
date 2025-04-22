from app.db.database import SessionLocal
from app.embeddings.content_embedding_manager import ContentEmbeddingManager
from app.data_models.user import User
import uuid

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
    "url": "https://medium.com/@sharathhebbar24/text-generation-v-s-text2text-generation-3a2b235ac19b",
    "title": "Text-2-Text Generation",
    "source": "medium"
}

# Step 3: Insert and summarize
content, content_ai = manager.insert_embedded_content(test_data)

# Step 4: Output
if content_ai:
    print("\n Summary:", content_ai.ai_summary)
else:
    print("\n No summary generated.")
