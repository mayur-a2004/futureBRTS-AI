from duckduckgo_search import DDGS
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)

class SearchClient:
    def search(self, query: str, max_results: int = 5) -> List[Dict]:
        """
        Performs a deep web search for missing information.
        """
        try:
            with DDGS() as ddgs:
                results = list(ddgs.text(query, max_results=max_results))
                return results
        except Exception as e:
            logger.error(f"Search failed: {e}")
            return []

search_client = SearchClient()
