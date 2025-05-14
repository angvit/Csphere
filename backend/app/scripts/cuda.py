import torch

print(f"PyTorch version: {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"CUDA device count: {torch.cuda.device_count()}")
    print(f"GPU Name: {torch.cuda.get_device_name(0)}")
    total_memory = torch.cuda.get_device_properties(0).total_memory / (1024 ** 3)
    print(f"GPU Total Memory: {total_memory:.2f} GB")
else:
    print("CUDA not available. You'll run LoRA on CPU (slow).")