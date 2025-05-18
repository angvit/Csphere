from app.managers.content_embedding_manager import ContentEmbeddingManager
from app.summarizer.local_summarizer import LocalSummarizer

url = "https://www.theguardian.com/science/2025/may/13/heart-cells-mouse-embryo-science-research"

# Use the same method that fetches and parses article
manager = ContentEmbeddingManager(db=None)  # Pass None if you just want to test summarization
html_text = manager._enrich_content(url, content_id=None, db=None)

# Summarize with your fine-tuned model
summarizer = LocalSummarizer("trained_models/t5_finetuned")
summary = summarizer.summarize(html_text)
print("Summary:", summary)
