from functools import lru_cache
from app.preprocessing.content_preprocessor import ContentPreprocessor
from app.ai.summarizer import Summarizer
from app.ai.embedder import Embedder


@lru_cache
def get_shared_services():
    pre = ContentPreprocessor()
    sumz = Summarizer(model="openrouter/auto:floor")
    emb = Embedder(model_name="text-embedding-3-small")
    return pre, sumz, emb
