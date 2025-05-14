from sentence_transformers import SentenceTransformer

class LocalEmbeddingManager:
    def __init__(self, model_name="all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)

    def generate_embedding(self, text):
        try:
            embedding = self.model.encode(text, normalize_embeddings=True)
            return embedding.tolist()  # ensure compatible storage format
        except Exception as e:
            print(f"Embedding generation failed: {e}")
            return None

    def query_embedding(self, query_text):
        return self.generate_embedding(query_text)
