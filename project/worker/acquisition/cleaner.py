import re
import logging

logger = logging.getLogger(__name__)

class ContentCleaner:
    def clean(self, raw_text: str) -> str:
        """
        Cleans raw scraped text for RAG processing.
        """
        if not raw_text: return ""
        
        # Remove multiple newlines
        text = re.sub(r'\n+', '\n', raw_text)
        # Remove extra spaces
        text = re.sub(r'\s+', ' ', text)
        # Remove URL artifacts usually found in footers
        text = re.sub(r'http[s]?://\S+', '', text)
        
        return text.strip()

cleaner = ContentCleaner()
