from fastapi import HTTPException
from pydantic import HttpUrl
from urllib.parse import urlparse

ALLOWED_SCHEMES = {"http", "https"}

def ensure_safe_url(url: HttpUrl):
    parsed_url = urlparse(url)
    if parsed_url.scheme not in ALLOWED_SCHEMES:
        raise HTTPException(status_code=400, detail="Invalid URL scheme")

