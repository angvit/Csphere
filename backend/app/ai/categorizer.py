from typing import Dict, List, Tuple
from app.classes import iab


class Categorizer:
    def __init__(self, file_path: str = "dummy.txt", file_url: str = ""):
        self._impl = iab.SolrQueryIAB(file_path=file_path, file_url=file_url)

    def categorize(self, ai_summary: str) -> Dict[str, List[Tuple[str, float]]]:
        self._impl.setAiSummary(ai_summary=ai_summary)
        self._impl.index_data()
        return self._impl.get_categories()
