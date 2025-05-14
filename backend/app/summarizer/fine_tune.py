from transformers import (
    AutoModelForSeq2SeqLM,
    AutoTokenizer,
    Trainer,
    TrainingArguments,
    DataCollatorForSeq2Seq,
)
from datasets import load_dataset

model_name = "t5-small"
dataset_path = "../data/summaries.json"
output_dir = "../trained_models/t5_finetuned"

# Load model and tokenizer
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

# Load dataset
dataset = load_dataset("json", data_files=dataset_path)

# Tokenize dataset
def preprocess(examples):
    inputs = tokenizer(examples["article"], max_length=512, truncation=True)
    labels = tokenizer(examples["highlights"], max_length=128, truncation=True)
    inputs["labels"] = labels["input_ids"]
    return inputs

tokenized_dataset = dataset.map(preprocess, batched=True)

# Data collator for padding
data_collator = DataCollatorForSeq2Seq(tokenizer, model=model)

# Training arguments
training_args = TrainingArguments(
    output_dir=output_dir,
    num_train_epochs=3,
    per_device_train_batch_size=2,   # small batch due to CPU constraint
    per_device_eval_batch_size=2,
    evaluation_strategy="epoch",
    save_strategy="epoch",
    logging_strategy="epoch",
    learning_rate=5e-5,
    weight_decay=0.01,
    save_total_limit=2,
    fp16=False,                    
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset["train"],
    eval_dataset=tokenized_dataset["train"].select(range(50)),
    tokenizer=tokenizer,
    data_collator=data_collator,
)

trainer.train()

model.save_pretrained(output_dir)
tokenizer.save_pretrained(output_dir)
