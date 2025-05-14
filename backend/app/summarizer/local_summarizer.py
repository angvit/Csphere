from transformers import pipeline

class LocalSummarizer:
    def __init__(self, model_name="../trained_models/t5_finetuned"):
        self.summarizer = pipeline("summarization", model=model_name, device=-1)  # CPU

    def summarize(self, text, min_length=20, max_length=60):
        try:
            summary = self.summarizer(
                text, max_length=max_length, min_length=min_length, do_sample=False
            )
            return summary[0]["summary_text"]
        except Exception as e:
            print(f"Summarization failed: {e}")
            return None