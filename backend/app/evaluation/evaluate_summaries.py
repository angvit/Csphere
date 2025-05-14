import json
from app.summarizer.local_summarizer import LocalSummarizer
from rouge_score import rouge_scorer

summarizer = LocalSummarizer("../trained_models/t5_finetuned")
scorer = rouge_scorer.RougeScorer(["rouge1", "rougeL"], use_stemmer=True)

with open("../data/evaluation_data.json") as f:
    data = json.load(f)

scores_list = []
for entry in data:
    generated_summary = summarizer.summarize(entry["article"])
    reference_summary = entry["reference_summary"]
    scores = scorer.score(reference_summary, generated_summary)
    scores_list.append(scores)

rouge1 = sum(s["rouge1"].fmeasure for s in scores_list) / len(scores_list)
rougeL = sum(s["rougeL"].fmeasure for s in scores_list) / len(scores_list)

print(f"Average ROUGE-1: {rouge1:.3f}") 
print(f"Average ROUGE-L: {rougeL:.3f}")