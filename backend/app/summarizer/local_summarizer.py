from transformers import AutoModelForSeq2SeqLM, AutoTokenizer, pipeline
import torch
import os


class LocalSummarizer:
    def __init__(self, model_name):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(model_name).to(
            "cuda" if torch.cuda.is_available() else "cpu"
        )
        self.summarizer = pipeline(
            "summarization",
            model=model_name,
            tokenizer=model_name,
            device=0 if torch.cuda.is_available() else -1
        )

    def summarize(self, text):
        summary = None
        try:
            summary = self.summarizer(text, max_length=128, truncation=True)[0]["summary_text"]
        except Exception as e:
            print(f"Summarization failed: {e}")
        return summary