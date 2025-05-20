import requests
import os
from dotenv import load_dotenv

load_dotenv()

FASTAPI_URL = os.getenv("FASTAPI_URL", "http://localhost:3000")
TOKEN = os.getenv("USER_TOKEN")  # User token (login token), set this in .env or export directly

def semantic_search(query):
    headers = {
        "Authorization": f"Bearer {TOKEN}"
    }

    params = {
        "query": query
    }

    response = requests.get(f"{FASTAPI_URL}/search", headers=headers, params=params)

    if response.status_code != 200:
        print(f"Search failed ({response.status_code}): {response.text}")
        return

    results = response.json()

    if not results:
        print("No results found.")
        return

    for idx, result in enumerate(results, start=1):
        print(f"\nResult {idx}:")
        print(f"Title: {result['title']}")
        print(f"URL: {result['url']}")
        print(f"Source: {result.get('source', 'N/A')}")
        print(f"First Saved At: {result['first_saved_at']}")
        print(f"AI Summary: {result['ai_summary']}")

if __name__ == "__main__":
    print("CSphere Content Search CLI Tool")
    query = input("Enter your query: ")
    semantic_search(query)
