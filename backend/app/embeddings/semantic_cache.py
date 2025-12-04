import numpy as np
import time 
from collections import OrderedDict

def cosine_similarity(a, b):
    a, b  = np.array(a), np.array(b)
    denom = (np.linalg.norm(a) * np.linalg.norm(b))
    if denom == 0:
        return 0
    return float(np.dot(a, b) / denom)

class SemanticCache:
    """
    A simple in-memory cache.
    """

    def __init__(self, similarity_threshold = 0.9, capacity: int = 1000):
        self.threshold = similarity_threshold
        self.capacity = capacity
        self.cache = OrderedDict()

    def find_similar(self, new_embedding):
        """Return a cache entry whose embedding is similar to new_embedding"""
        for entry in self.cache.values():
            similarity = cosine_similarity(new_embedding, entry["embedding"])
            if similarity >= self.threshold:
                return entry
        return None
    
    def add(self, embedding, results):
        """Store embeddings and results in the lru cache"""
        if len(self.cache) >= self.capacity:
            self.cache.popitem(last=False) # evict the oldest item
        
        ts = time.time()
        self.cache[ts] = {
            "embedding": embedding,
            "results": results,
            "timestamp": ts
        } 