import os
import numpy as np
from app.summarizer.local_summarizer import LocalSummarizer
from app.embeddings.local_embedding_manager import LocalEmbeddingManager
from app.managers.content_embedding_manager import ContentEmbeddingManager


URLS = [
    "https://domenic.me/chatgpt-simulacrum/",
    "https://www.goto10retro.com/p/about-asteroids-ataris-biggest-arcade",
    "https://blog.briankitano.com/llama-from-scratch/",
    "https://www.statepress.com/article/2025/05/opinion-misinformation-rabbit-hole-saving#",
    "https://amberwilliams.io/blogs/building-my-own-pkms",
    "https://www.theverge.com/news/669157/china-begins-assembling-its-supercomputer-in-space",
    "https://www.construction-physics.com/p/why-its-so-hard-to-build-a-jet-engine",
    "https://www.construction-physics.com/p/how-to-build-a-20-billion-semiconductor",
    "https://cs.stanford.edu/people/eroberts/courses/ww2/projects/jet-airplanes/how.html",
    "https://vitonsky.net/blog/2022/06/08/complicated-software/"
]

# In-memory store

embeddings = []

def prepare_documents():
    print("Preparing and embedding documents...\n")
    summarizer = LocalSummarizer("angvit/flan-t5-csphere")
    embedder = LocalEmbeddingManager("all-MiniLM-L6-v2")
    manager = ContentEmbeddingManager(db=None)

    summaries = []

    for url in URLS:
        print(f"Fetching: {url}")
        html_text = manager._enrich_content(url)
        if not html_text:
            continue

        summary = summarizer.summarize(html_text)
        if not summary:
            continue

        print(f"Summary: {summary}")

        vector = manager._generate_embedding(summary)

        summaries.append({
            "url": url,
            "summary": summary,
            "vector": vector
        })
    return summaries


if __name__ == "__main__":
    print("CSphere CLI Semantic Search on Sample URLs")
    docs = prepare_documents()

    while True:
        query = input("Enter query (or 'exit'): ").strip()
        if query == "exit":
            break

        embedder = LocalEmbeddingManager("all-MiniLM-L6-v2")
        query_vector = embedder.generate_embedding(query)

        # Compute cosine similarities
        def cosine_sim(a, b):
            import numpy as np
            a, b = np.array(a), np.array(b)
            return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

        ranked = sorted(docs, key=lambda doc: cosine_sim(query_vector, doc["vector"]), reverse=True)
        print("\nTop Results:")
        for doc in ranked[:3]:
            print(f"- {doc['url']}\n  Summary: {doc['summary']}\n")
