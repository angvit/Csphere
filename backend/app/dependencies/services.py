from functools import lru_cache
from app.preprocessing.content_preprocessor import ContentPreprocessor
from app.ai.summarizer import Summarizer
from app.ai.embedder import Embedder
from app.embeddings.content_embedding_manager import ContentEmbeddingManager


@lru_cache
def get_shared_services():
    content_preprocessor = ContentPreprocessor()
    summarizer = Summarizer(model="openrouter/auto:floor")
    embedder = Embedder(model_name="text-embedding-3-small")
    return content_preprocessor, summarizer, embedder


@lru_cache
def get_embedding_manager():
    content_preprocessor, summarizer, embedder = get_shared_services()
    return ContentEmbeddingManager(
        db=None,
        preprocessor=content_preprocessor,
        summarizer=summarizer,
        embedder=embedder
    )
