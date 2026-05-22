import requests
from bs4 import BeautifulSoup
import logging
from urllib.parse import quote
import random
import time
import re

logger = logging.getLogger(__name__)

class TightScraper:
    """
    TIGHT GLOBAL SCRAPER (V.4.0)
    High-Resilience Extraction Logic for Mission-Critical Truth.
    """
    def __init__(self):
        self.user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1"
        ]

    def _get_headers(self):
        return {
            "User-Agent": random.choice(self.user_agents),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Referer": "https://www.google.com/",
            "DNT": "1"
        }

    def fetch_truth(self, question: str):
        """
        Domain-Aware Tight Scrapping Strategy.
        Recognizes technical fields (ML, DL, DSA, DS, DA, Science) for precision.
        """
        logger.info(f"🔥 NEURAL ATTACK ON WEB: {question}")
        
        # 🧪 DOMAIN INTELLIGENCE: Heavy focus on technical precision
        technical_context = ""
        low_q = question.lower()
        if any(w in low_q for w in ["machine learning", "deep learning", "neural", "tensor", "gradient"]):
            technical_context = " (Deep Learning/ML Architecture)"
        elif any(w in low_q for w in ["complexity", "algorithm", "dsa", "tree", "graph", "sort"]):
            technical_context = " (Data Structures / Algorithms)"
        elif any(w in low_q for w in ["data science", "analysis", "statistics", "probability", "visualization"]):
            technical_context = " (Data Science / Analysis)"
        elif any(w in low_q for w in ["physics", "chemistry", "biology", "scientific", "experiment"]):
            technical_context = " (Scientific Principle)"

        refined_query = question + technical_context
        
        # Strategy 1: DuckDuckGo (High Speed)
        truth = self._scrape_ddg(refined_query)
        if truth:
            return self._clean_truth(truth, is_technical=bool(technical_context))
            
        # Strategy 2: Google Advanced Snippet (Deep Search)
        truth = self._scrape_google_lite(refined_query)
        if truth:
            return self._clean_truth(truth, is_technical=bool(technical_context))
            
        return "System Warning: Deep Technical Truth extraction failed. Using local DB."

    def _scrape_ddg(self, query: str):
        try:
            url = f"https://html.duckduckgo.com/html/?q={quote(query)}"
            res = requests.get(url, headers=self._get_headers(), timeout=8)
            res.raise_for_status()
            soup = BeautifulSoup(res.text, "lxml")
            
            # Target Snippets
            elements = soup.select(".result__snippet")
            if elements:
                return " ".join([e.text for e in elements[:3]])
        except Exception as e:
            logger.warning(f"DDG Scrape Shielded: {e}")
        return None

    def _scrape_google_lite(self, query: str):
        """
        Lightweight Google Scraper (Heuristic-based)
        """
        try:
            url = f"https://www.google.com/search?q={quote(query)}&hl=en"
            res = requests.get(url, headers=self._get_headers(), timeout=8)
            res.raise_for_status()
            soup = BeautifulSoup(res.text, "lxml")
            
            # Google often serves snippets in specific divs (LGOve, VwiC3b, etc.)
            snippets = []
            for div in soup.select('div[data-nosnippet], .VwiC3b, .yXVvP'):
                text = div.get_text().strip()
                if len(text) > 20:
                    snippets.append(text)
            
            if snippets:
                return " ".join(snippets[:2])
        except Exception as e:
            logger.warning(f"Google Scrape Shielded: {e}")
        return None

    def _clean_truth(self, text: str, is_technical: bool = False):
        """
        Neural Data Sanitization with Context Preservation.
        """
        # Remove URLs
        text = re.sub(r'http\S+', '', text)
        
        if is_technical:
            # Preserve mathematical symbols and key abbreviations for science/DL
            text = re.sub(r'[^a-zA-Z0-9\s\.\,\?\!\:\-\(\)\{\}\[\]\*\+\/\=\%\^\&\@\_]', '', text)
        else:
            # Standard cleanup
            text = re.sub(r'[^a-zA-Z0-9\s\.\,\?\!\:\-]', '', text)
            
        text = " ".join(text.split())
        return text[:800] # Expanded to 800 for deep technicals

scraper = TightScraper()
