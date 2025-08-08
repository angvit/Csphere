import os
from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup
from openai import OpenAI
from keybert import KeyBERT
from sklearn.metrics.pairwise import cosine_similarity
import torch



load_dotenv()

openai_api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=openai_api_key)
kw_model = KeyBERT(model='all-MiniLM-L6-v2')

bookmarks = [
    {
        "title": "AI at Meta – Advancing the Future of AI",
        "notes": "Explore Meta's research and innovation in AI",
        "url": "https://ai.meta.com/"
    },
    {
        "title": "Google DeepMind",
        "notes": "Cutting-edge AI research and applications",
        "url": "https://www.deepmind.com/"
    },
    # {
    #     "title": "Anthropic – Building Reliable, Interpretable, and Steerable AI Systems",
    #     "notes": "AI safety and Claude model development",
    #     "url": "https://www.anthropic.com/"
    # }
]

# def fetch_content_docling(url):
#     text = urllib.request.urlopen(url).read()
#     in_doc = InputDocument(
#         path_or_stream=BytesIO(text),
#         format=InputFormat.HTML,
#         backend=HTMLDocumentBackend,
#         filename="doc.html"
#     )
#     backend = HTMLDocumentBackend(in_doc=in_doc, path_or_stream=BytesIO(text))
#     dl_doc = backend.convert()
#     print("extracted text: ",dl_doc.export_to_markdown())

#     return dl_doc.export_to_markdown()


def fetch_content(url):
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def extract_visible_text(html):
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "meta", "head", "noscript"]):
        tag.decompose()
    return soup.get_text(separator=' ', strip=True)

def summarize_text(text, max_tokens=100):
    prompt = f"Summarize the following webpage content in 2-3 sentences\n\n{text[:3000]}"
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
        max_tokens=max_tokens
    )
    return response.choices[0].message.content.strip()

def deduplicate_keywords_semantically(keywords, summary, threshold=0.75):
    if len(keywords) <= 1:
        return [kw[0] for kw in keywords]

    phrases = [kw[0] for kw in keywords]
    phrase_embeddings = kw_model.model.embed(phrases)
    summary_embedding = kw_model.model.embed([summary])[0]

    if isinstance(phrase_embeddings, torch.Tensor):
        phrase_embeddings = phrase_embeddings.cpu().detach().numpy()
    if isinstance(summary_embedding, torch.Tensor):
        summary_embedding = summary_embedding.cpu().detach().numpy()

    sim_matrix = cosine_similarity(phrase_embeddings)
    rep_scores = cosine_similarity(phrase_embeddings, [summary_embedding]).flatten()

    selected = []
    removed = set()

    for i, kw_i in enumerate(phrases):
        if kw_i in removed:
            continue
        best_kw = kw_i
        best_score = rep_scores[i]
        for j in range(i + 1, len(phrases)):
            kw_j = phrases[j]
            if kw_j in removed or sim_matrix[i][j] < threshold:
                continue
            if rep_scores[j] > best_score:
                removed.add(best_kw)
                best_kw = kw_j
                best_score = rep_scores[j]
            else:
                removed.add(kw_j)
        selected.append(best_kw)

    return selected

def extract_keywords(summary):
    raw_keywords = kw_model.extract_keywords(summary, keyphrase_ngram_range=(1, 2), stop_words='english', top_n=4)
    return deduplicate_keywords_semantically(raw_keywords, summary)

generated_tags = {}

for bookmark in bookmarks:

    print(f"Processing bookmark: {bookmark['url']}")
    html_content = fetch_content(bookmark["url"])
    if not html_content:
        continue

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

print("\nGenerated tags for bookmarks:\n", generated_tags)