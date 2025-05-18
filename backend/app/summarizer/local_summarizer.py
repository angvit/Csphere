from transformers import pipeline
import os

class LocalSummarizer:
    def __init__(self, model_name="trained_models/t5_finetuned"):
        base_dir = os.path.dirname(os.path.abspath(__file__))  # backend/app/summarizer
        print(base_dir)
        backend_root = os.path.abspath(os.path.join(base_dir, "..", ".."))  # points to backend/
        print(backend_root)
        model_path = os.path.join(backend_root, model_name)

        print("Resolved model path:", model_path)  # Debug print

        if not os.path.isdir(model_path):
            raise FileNotFoundError(f"Model directory not found: {model_path}")

        if not os.path.isdir(model_path):
            raise FileNotFoundError(f"Model directory not found: {model_path}")
        self.summarizer = pipeline(
            "summarization",
            model=model_path,
            tokenizer=model_path,
            device=-1  
        )

    def summarize(self, text, min_length=20, max_length=120):
        try:
            prompt = f"summarize this article in a concise and informative way in 2-3 sentences: {text}"
            summary = self.summarizer(
                prompt, max_length=max_length, min_length=min_length, do_sample=False
            )
            return summary[0]["summary_text"]
        except Exception as e:
            print(f"Summarization failed: {e}")
            return None