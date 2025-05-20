import json
from datasets import load_dataset

# Output container
out = []

# Limit sizes
SIZES = {
    "xsum": 1000,
    "cnn_dailymail": 1000,
    "reddit_tifu": 500
}

# Load datasets using built-in slicing (no streaming)
datasets = [
    ("xsum", load_dataset("xsum", split=f"train[:{SIZES['xsum']}]")),
    ("cnn_dailymail", load_dataset("cnn_dailymail", "3.0.0", split=f"train[:{SIZES['cnn_dailymail']}]")),
    ("reddit_tifu", load_dataset("reddit_tifu", "short", split=f"train[:{SIZES['reddit_tifu']}]")),
]

# Process examples
for name, ds in datasets:
    for example in ds:
        article = (
            example.get("document")
            or example.get("article")
            or example.get("text")
        )
        summary = (
            example.get("summary")
            or example.get("highlights")
            or example.get("tldr")
        )
        if not article or not summary:
            continue

        # Trim to 2 sentences
        sentences = summary.split(". ")
        summary_2_sent = ". ".join(sentences[:2]).strip()
        if not summary_2_sent.endswith("."):
            summary_2_sent += "."

        out.append({
            "article": article.strip(),
            "summary": summary_2_sent
        })

# Train/eval split
split_idx = int(len(out) * 0.9)
train_data = out[:split_idx]
eval_data = out[split_idx:]

# Save to disk
with open("backend/app/data/summaries.json", "w", encoding="utf-8") as f:
    json.dump(train_data, f, indent=2, ensure_ascii=False)

with open("backend/app/data/evaluation_data.json", "w", encoding="utf-8") as f:
    json.dump(eval_data, f, indent=2, ensure_ascii=False)
