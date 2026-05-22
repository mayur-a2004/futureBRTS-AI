import logging
import re
from services.scraper_service import scraper

logger = logging.getLogger(__name__)

def run(payload, prompt=None):
    """
    TRUTH SCRAPING PIPELINE
    Pre-processes questions to find Global Truth and generate Hints.
    """
    questions = payload.get("questions", [])
    results = []
    
    logger.info(f"🌍 PRE-SCRAPING TRUTH FOR {len(questions)} QUESTIONS...")
    
    for q in questions:
        q_id = q.get("id")
        q_text = q.get("question", "")
        q_type = q.get("type")
        
        # Scrape Global Truth
        truth = scraper.fetch_truth(q_text)
        
        # Generate Hint for VIVA
        hint = ""
        if q_type == "VIVA":
            # DS Logic: Extract the most technical keywords from the truth but hide the answer
            # This follows "Normal Hint" requirement
            words = re.findall(r'\w+', truth)
            technical_keywords = [w for w in words if len(w) > 5]
            if len(technical_keywords) >= 2:
                hint = f"Think about concepts related to {technical_keywords[0]} and {technical_keywords[1]}"
            else:
                hint = "Focus on the core technical principle mentioned in the task."
        
        results.append({
            "id": q_id,
            "truth": truth,
            "hint": hint
        })
        
    return results
