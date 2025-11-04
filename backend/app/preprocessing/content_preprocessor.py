from bs4 import BeautifulSoup
from readability import Document
import re


class ContentPreprocessor:
    """
    Extracts metadata and readable body from raw HTML, cleans text, and builds a summary input string.
    """

    def extract(self, html: str) -> dict:
        soup = BeautifulSoup(html, "html.parser")

        title = soup.title.string.strip() if soup.title else ""
        description = ""
        tags = []

        for meta in soup.find_all("meta"):
            if meta.get("name") == "description":
                description = meta.get("content", "")
            if meta.get("property") == "og:description":
                description = meta.get("content", "") or description
            if meta.get("name") == "keywords":
                tags = [tag.strip() for tag in meta.get("content", "").split(",")]

        doc = Document(html)
        body = BeautifulSoup(doc.summary(), "html.parser").get_text()

        return {
            "title": title,
            "description": description,
            "tags": tags,
            "body_text": body.strip(),
        }

    def clean(self, text: str, max_chars: int = 1000) -> str:
        lines = text.split("\n")
        cleaned = []

        for line in lines:
            line = line.strip()
            if not line or re.search(r"(©|\ball rights\b|cookie|advertisement)", line, re.I):
                continue
            cleaned.append(line)

        joined = " ".join(cleaned)
        return joined[:max_chars]

    def build_summary_input(self, metadata: dict) -> str:
        input_parts = []

        if metadata.get("title"):
            input_parts.append(f"Title: {metadata['title']}")
        if metadata.get("description"):
            input_parts.append(f"Description: {metadata['description']}")
        if metadata.get("tags"):
            input_parts.append(f"Tags: {', '.join(metadata['tags'])}")
        if metadata.get("body_text"):
            input_parts.append(f"Content:\n\n{metadata['body_text']}")

        return "\n".join(input_parts)

