from app.db.database import engine, Base
from app.data_models import content, content_ai, content_item, user, folder, folder_item

Base.metadata.create_all(bind=engine)
print("All tables created")