from app.db.database import engine, Base
import app.data_models

Base.metadata.create_all(bind=engine)
print("All tables created")