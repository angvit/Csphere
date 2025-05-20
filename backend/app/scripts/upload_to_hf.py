from huggingface_hub import create_repo, upload_folder

# create_repo("flan-t5-csphere")

upload_folder(
    repo_id="angvit/flan-t5-csphere",
    folder_path="backend/app/trained_models/t5_finetuned_base",
    repo_type="model"
)