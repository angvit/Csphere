from transformers import (
    AutoModelForSeq2SeqLM,
    AutoTokenizer,
    Trainer,
    TrainingArguments,
    DataCollatorForSeq2Seq,
    EarlyStoppingCallback
)
from datasets import load_dataset
from evaluate import load
import numpy as np
import os
import time

# === Load ROUGE ===
rouge = load("rouge")

# === Config ===
model_name = "t5-base"
dataset_path = "backend/app/data/summaries.json"
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
output_dir = os.path.join(project_root, "trained_models", "t5_finetuned_base")

# === Load tokenizer and model ===
tokenizer = AutoTokenizer.from_pretrained(model_name, model_max_length=1024)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
model.gradient_checkpointing_enable()

# === Load and split dataset ===
raw_dataset = load_dataset("json", data_files=dataset_path)["train"]

# Set maximum number of examples to train on
max_examples = min(3000, len(raw_dataset))  # Adjust based on available time/GPU
raw_dataset = raw_dataset.select(range(max_examples))

# Split dataset
split_dataset = raw_dataset.train_test_split(test_size=0.1, seed=42)

# Filter out bad entries
split_dataset = split_dataset.filter(
    lambda x: x["article"] and x["summary"] and x["summary"].strip()
)

# === Preprocessing ===
def preprocess(examples):
    inputs = ["summarize: " + article for article in examples["article"]]
    model_inputs = tokenizer(inputs, max_length=1024, truncation=True)

    with tokenizer.as_target_tokenizer():
        labels = tokenizer(examples["summary"], max_length=128, truncation=True)

    # Mask padding tokens in the labels
    labels["input_ids"] = [
        [(token if token != tokenizer.pad_token_id else -100) for token in label]
        for label in labels["input_ids"]
    ]

    model_inputs["labels"] = labels["input_ids"]
    return model_inputs

tokenized_dataset = split_dataset.map(preprocess, batched=True)
data_collator = DataCollatorForSeq2Seq(tokenizer, model=model)

# === Metric computation ===
def compute_metrics(eval_pred):
    predictions, labels = eval_pred

    # Ensure predictions are token IDs
    if isinstance(predictions, tuple):
        predictions = predictions[0]

    # Convert logits to token IDs if needed
    if predictions.ndim == 3:
        predictions = np.argmax(predictions, axis=-1)

    # Convert to plain list (sometimes it's a NumPy array)
    predictions = predictions.tolist()
    labels = labels.tolist()

    # Decode predictions
    decoded_preds = tokenizer.batch_decode(predictions, skip_special_tokens=True)

    # Replace -100 with pad_token_id for decoding
    cleaned_labels = [
        [token if token != -100 else tokenizer.pad_token_id for token in label]
        for label in labels
    ]
    decoded_labels = tokenizer.batch_decode(cleaned_labels, skip_special_tokens=True)

    # Compute metrics
    result = rouge.compute(predictions=decoded_preds, references=decoded_labels)
    return {
        "rouge1": result["rouge1"],
        "rougeL": result["rougeL"],
    }



# === Training arguments ===
training_args = TrainingArguments(
    output_dir=output_dir,
    num_train_epochs=4,
    per_device_train_batch_size=1,
    per_device_eval_batch_size=1,
    gradient_accumulation_steps=2,
    evaluation_strategy="epoch",
    save_strategy="epoch",
    logging_strategy="steps",
    logging_steps=10,
    save_total_limit=2,
    learning_rate=5e-5,
    weight_decay=0.01,
    metric_for_best_model="rougeL",
    load_best_model_at_end=True,
    greater_is_better=True,
    remove_unused_columns=True,
    fp16=False,
    dataloader_num_workers=0
)


# === Trainer ===
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset["train"],
    eval_dataset=tokenized_dataset["test"],
    tokenizer=tokenizer,
    data_collator=data_collator,
    compute_metrics=compute_metrics,
    callbacks=[EarlyStoppingCallback(early_stopping_patience=2)]
)

# === Train ===
start = time.time()
trainer.train()
print(f"\nTraining completed in {(time.time() - start) / 60:.2f} minutes.")

# === Save ===
os.makedirs(output_dir, exist_ok=True)
model.save_pretrained(output_dir)
tokenizer.save_pretrained(output_dir)
