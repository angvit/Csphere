import uvicorn 
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os 
import logging
import sys


from app.routes import user_router, folder_router, auth_router, content_router, setting_router

# Load environment variables from a .env file
load_dotenv()


app = FastAPI()

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# StreamHandler
stream_handler = logging.StreamHandler(sys.stdout)
log_formatter = logging.Formatter("%(asctime)s [%(processName)s: %(process)d] [%(threadName)s: %(thread)d] [%(levelname)s] %(name)s: %(message)s")
stream_handler.setFormatter(log_formatter)
logger.addHandler(stream_handler)

logger.info('API is starting up')


# Update CORS origins
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


app.include_router(user_router)
app.include_router(folder_router)
app.include_router(auth_router)
app.include_router(content_router)
app.include_router(setting_router)



if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.api.main:app", host="0.0.0.0", port=port)



