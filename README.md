# CSphere Summarization & Embedding

This repo contains a possible summarization and embedding backend to power [CSphere](https://csphere-beta.vercel.app/), a semantic personal assistant that helps users rediscover forgotten saved content. It summarizes article text using a fine-tuned [Flan-T5](https://huggingface.co/google/flan-t5-base) model and embeds the result using [Sentence-BERT](https://www.sbert.net/), enabling efficient natural-language search over curated content.

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

## CSphere CLI Search Tool

The `cli_search.py` script allows you to test the summarization and embedding functionality on a small batch of hardcoded URLs. It scrapes and cleans article content, generates a summary using the fine-tuned T5 model, embeds the summary using MiniLM, and then lets you semantically query to retrieve the most relevant documents without needing a database or server.

### How to run

Make sure you've installed the dependencies (see `requirements.txt`) and activated your virtual environment.

Then run:

```bash
PYTHONPATH=backend python backend/app/scripts/cli_search.py # or $env:PYTHONPATH="backend"; python .\backend\app\scripts\cli_search.py on Windows
```

### Example query

Once the cli tool is running, you'll be prompted to enter a query.

Try typing:

```
how do jet engines work
```

or

```
why is modern software so bloated
```
