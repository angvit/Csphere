from datasets import load_dataset
import json

out = []

datasets = [
    load_dataset("xsum", split="train[:70]"),
    load_dataset("cnn_dailymail", "3.0.0", split="train[:70]"),
    load_dataset("reddit_tifu", "short", split="train[:60]")
]

for ds in datasets:
    for example in ds:
        article = example.get("document") or example.get("article") or example.get("text")
        summary = example.get("summary") or example.get("highlights") or example.get("tldr")
        if not article or not summary:
            continue
        # Limit to 2 sentences max
        sentences = summary.split(". ")
        summary_2_sent = ". ".join(sentences[:2]).strip()
        if not summary_2_sent.endswith("."):
            summary_2_sent += "."

        out.append({
            "article": article.strip(),
            "summary": summary_2_sent
        })


with open("app/data/summaries.json", "w") as f:
    json.dump(out, f, indent=2)

print(f"Saved {len(out)} diverse examples.")
