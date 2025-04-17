from dateparser.search import search_dates
from datetime import datetime
from typing import Optional, Tuple
import re


class QueryPreprocessor:
    '''
    Utility class to preprocess user search queries. 
    Extracts semantic query, possible time ranges, and source filters from natural language.
    '''

    def __init__(self):
        self.known_sources = ["hacker news", "reddit", "arxiv", "twitter", "youtube", "medium"]


    def preprocess_query(self, query_text: str) -> dict:
        '''
        Takes in a natural langauge query and returns a structured version with a clean query 
        for future embedding, a start and end date/time for time filtering if necessary,
        and a source filter. 
        '''
        semantic_query = query_text.lower()
        start_date, end_date = self._extract_time_range(semantic_query)
        source = self._extract_source(semantic_query)
        semantic_query = self._strip_matched_phrases(semantic_query)

        return {
            "semantic_query": semantic_query.strip(),
            "start_date": start_date,
            "end_date": end_date,
            "source": source
        }
    

    def _extract_time_range(self, text: str):
        '''
        Interprets natural language expressions like "3 months ago" or "in January"
        and converts them to actual datetime ranges that we can use to filter search results. 
        '''

        now = datetime.datetime.now(datetime.timezone.utc)
        matches = search_dates(text, settings={"RELATIVE_BASE": now}) # list of tuples of phrases and datetime representations of them

        if matches:
            # keeping it simple and only taking the first time phrase found
            matched_phrase, parsed_date = matches[0] 
            self.last_matched_phrase = matched_phrase
            return parsed_date, now # creating the filter range
        return None, None
    

    def _extract_source(self, text: str):
        '''
        If a user searches "llm papers from arxiv", want search to interpret it as a constraint
        and not just metadata. If we detect "source" in the user query, we want to filter the results
        for that specific source. 
        '''

        for source in self.known_sources:
            if source in text:
                self._last_matched_source = source
                return source
        return None
    

    def _strip_matched_phrases(self, text: str) -> str:
        '''
        Removes the matched time phrases and source names from the query before it's embedded.

        Before: 
            query = "Articles I saved 3 months ago about AI from Reddit"
            semantic_query = "articles i saved 3 months ago about ai from reddit"

        After:
            semantic_query = "articles i saved about ai"

        In this example, we don't want to embed the entire sentence, we want to filter the content
        from three months ago, embed "articles i saved about ai" and show the results (through sql query)
        that match both.
        '''

        if hasattr(self, "last_matched_phrase"):
            text = text.replace(self.last_matched_phrase, "") # removes time phrase found earlier
        if hasattr(self, "_last_matched_source"):
            text = text.replace(self._last_matched_source, "") # removes source name found earlier
        return re.sub(r"\s+", " ", text).strip() # replacing multiple spaces in the text with a single space and stripping any additional whitedspace

            


