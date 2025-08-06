import os
from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup
from openai import OpenAI
from keybert import KeyBERT
import numpy as np

load_dotenv()

openai_api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=openai_api_key)
kw_model = KeyBERT(model='all-MiniLM-L6-v2')

bookmarks = [
    {
        "title": "Prompt Engineering Guide | Prompt Engineering Guide",
        "notes": "",
        "url": "https://www.promptingguide.ai/"
    },
    {
        "title": "Hugging Face – The AI Community Building the Future",
        "notes": "Explore transformers and pretrained models",
        "url": "https://huggingface.co/"
    },
    {
        "title": "LangChain – Build Context-Aware AI Apps",
        "notes": "LangChain helps build apps powered by LLMs with memory, chaining, etc.",
        "url": "https://www.langchain.com/"
    }
]

# Fetch HTML content from URL
def fetch_content(url):
    try:
        response = requests.get(url, timeout = 10)
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"Error fetching {url}:{e}")
        return None
    
# Get visible text
def extract_visible_text(html):
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "meta", "head", "noscript"]):
        tag.decompose()
    return soup.get_text(separator = ' ',  strip=True)

# Summarizing with openai
def summarize_text(text, max_tokens = 100):
    prompt = f"Summarize the following webpage content in 2-3 sentences\n\n{text[:3000]}"
    response = client.chat.completions.create(
        model = "gpt-4o",
        messages = [{"role": "user", "content": prompt}],
        temperature = 0.5,
        max_tokens = max_tokens
    )
    return response.choices[0].message.content.strip()

def extract_keywords(summary):
    keywords = kw_model.extract_keywords(summary, keyphrase_ngram_range = (1,2), stop_words = 'english', top_n = 3)
    return [kw[0] for kw in keywords]

'''# Generate embeddings
def generate_embedding(text):
    response = client.embeddings.create(
        model = "text-embedding-3-small",
        input = text
    )
    return response.data[0].embedding'''

generated_tags = {}

for bookmark in bookmarks:
    print(f"Processing bookmark: {bookmark['url']}")


    html_content = fetch_content(bookmark["url"])
    if not html_content:
        exit


    visible_text = extract_visible_text(html_content)
    print("Extracted content:\n", visible_text[:300] + "..." if len(visible_text) > 300 else visible_text)

    summary = summarize_text(visible_text)
    print("Summarized text:\n", summary)

    tags = extract_keywords(summary)
    print("Extracted tags:\n", tags)

    generated_tags[bookmark["url"]] = {
        "title": bookmark.get("title", ""),
        "summary": summary,
        "tags": tags
    }

print("Generated tags for bookmarks:\n", generated_tags)

summaries = [info["summary"] for info in generated_tags.values()]
corpus = ''.join(summaries)

global_keywords = kw_model.extract_keywords(corpus, keyphrase_ngram_range = (1,2), stop_words = 'english', top_n = 5)

global_topics = [{"keyword": kw, "score": score} for kw, score in global_keywords]
print("Global keywords across bookmarks:\n", global_topics)

