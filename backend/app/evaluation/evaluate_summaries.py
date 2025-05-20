import json
from app.summarizer.local_summarizer import LocalSummarizer
from rouge_score import rouge_scorer
from evaluate import load

bleu = load("bleu")
meteor = load("meteor")
bertscore = load("bertscore")

summarizer = LocalSummarizer("trained_models/t5_finetuned_base")
scorer = rouge_scorer.RougeScorer(["rouge1", "rouge2", "rougeL"], use_stemmer=True)

with open("backend/app/data/evaluation_data.json") as f:
    data = json.load(f)

rouge_scores = []
labels = []
predictions = []

for entry in data:
    generated_summary = summarizer.summarize(entry["article"])
    reference_summary = entry["summary"]
    
    scores = scorer.score(reference_summary, generated_summary)
    rouge_scores.append(scores)

    # gathering for bleu, meteor., and bertscore
    predictions.append(generated_summary)
    labels.append(reference_summary)

rouge1 = sum(s["rouge1"].fmeasure for s in rouge_scores) / len(rouge_scores)
rouge2 = sum(s["rouge2"].fmeasure for s in rouge_scores) / len(rouge_scores)
rougeL = sum(s["rougeL"].fmeasure for s in rouge_scores) / len(rouge_scores)

bleu_result = bleu.compute(predictions=predictions, references=[label for label in labels])
meteor_result = meteor.compute(predictions=predictions, references=labels)
bertscore_result = bertscore.compute(predictions=predictions, references=labels, lang="en", device="cuda:0")

print(f"Average ROUGE-1: {rouge1:.3f}")
print(f"Average ROUGE-2: {rouge2:.3f}")
print(f"Average ROUGE-L: {rougeL:.3f}")
print(f"BLEU: {bleu_result['bleu']:.3f}")
print(f"METEOR: {meteor_result['meteor']:.3f}")
print(f"BERTScore (F1): {sum(bertscore_result['f1']) / len(bertscore_result['f1']):.3f}")