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

rouge = load("rouge")

def compute_metrics(eval_pred):
    predictions, labels = eval_pred

    if isinstance(predictions, tuple):
        predictions = predictions[0]

    decoded_preds = tokenizer.batch_decode(predictions, skip_special_tokens=True)
    decoded_labels = tokenizer.batch_decode(labels, skip_special_tokens=True)

    result = rouge.compute(predictions=decoded_preds, references=decoded_labels)
    
    # Only return the scores you care about
    return {
        "rouge1": result["rouge1"].mid.fmeasure,
        "rougeL": result["rougeL"].mid.fmeasure
    }

model_name = "t5-small"
dataset_path = "backend/app/data/summaries.json"
output_dir = "../trained_models/t5_finetuned"

# Load model and tokenizer
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

# Load dataset
dataset = load_dataset("json", data_files=dataset_path)

# Tokenize dataset
def preprocess(examples):
    inputs = ["summarize: " + article for article in examples["article"]]
    model_inputs = tokenizer(inputs, max_length=1024, truncation=True)

    with tokenizer.as_target_tokenizer():
        labels = tokenizer(examples["summary"], max_length=128, truncation=True)

    model_inputs["labels"] = labels["input_ids"]
    return model_inputs

tokenized_dataset = dataset.map(preprocess, batched=True)

# Data collator for padding
data_collator = DataCollatorForSeq2Seq(tokenizer, model=model)

# Training arguments
training_args = TrainingArguments(
    output_dir=output_dir,
    num_train_epochs=6,
    per_device_train_batch_size=2,   # small batch due to CPU constraint
    per_device_eval_batch_size=2,
    eval_strategy="epoch",
    save_strategy="epoch",
    logging_strategy="epoch",
    learning_rate=5e-5,
    weight_decay=0.01,
    save_total_limit=2,
    fp16=False,  
    metric_for_best_model="rougeL",
    load_best_model_at_end=True,
    greater_is_better=True              
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset["train"],
    eval_dataset=tokenized_dataset["train"].select(range(50)),
    tokenizer=tokenizer,
    data_collator=data_collator,
    callbacks=[EarlyStoppingCallback(early_stopping_patience=2)],
    compute_metrics=compute_metrics
)

trainer.train()

model.save_pretrained(output_dir)
tokenizer.save_pretrained(output_dir)
