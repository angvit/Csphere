# CSphere Summarization & Embedding Module

This repo contains the summarization and embedding backend powering [CSphere](https://csphere.ai) — a semantic personal assistant that helps users rediscover forgotten saved content. It summarizes article text using a fine-tuned [Flan-T5](https://huggingface.co/google/flan-t5-base) model and embeds the result using [Sentence-BERT](https://www.sbert.net/), enabling efficient natural-language search over curated content.

---

## Getting Started

### 1. Clone & Set Up Environment

```bash
git clone https://github.com/yourusername/csphere-summarizer.git
cd csphere-summarizer
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
```
