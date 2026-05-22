import logging
import asyncio
from datetime import datetime
from acquisition.search_client import search_client
from acquisition.scraper import scraper
from acquisition.cleaner import cleaner
from rag.retriever import retriever
from storage.memory import memory

logger = logging.getLogger(__name__)

class ContentHarvester:
    """
    Titan's Autonomous Knowledge Acquisition System.
    Runs in the background to scrape trending topics and documentation from LEGAL SOURCES.
    """
    
    def __init__(self):
        # Priority on arXiv, Wiki, and Open Docs
        self.active_topics = [
            "site:wikipedia.org React 19 features", 
            "site:arxiv.org AI Agents Survey",
            "site:python.org Python 3.14 changelog",
            "site:mozilla.org MDN Web Docs",
            "site:stackoverflow.com questions python optimization"
        ]
        
    async def run_harvest_cycle(self):
        logger.info("Harvest Cycle Initiated (Legal Mode)...")
        try:
            for topic in self.active_topics:
                logger.info(f"Harvesting: {topic}")
                # 1. Search
                results = search_client.search(topic, max_results=2)
                
                for res in results:
                    link = res.get("href")
                    if not link: continue
                    
                    # 1.1 Compliance Check
                    if any(x in link for x in ["youtube.com", "facebook.com", "linkedin.com", "instagram.com"]):
                        logger.warning(f"Skipping non-compliant source: {link}")
                        continue

                    # 2. Scrape
                    raw = scraper.scrape_url(link)
                    cleaned = cleaner.clean(raw)
                    
                    if len(cleaned) > 200:
                        # 3. Store in Vector Memory
                        retriever.add(cleaned[:5000], metadata={"source": link, "topic": topic})
                        
                        # 4. Log to DB
                        valid_data = {
                            "source": link,
                            "type": "web_scrape",
                            "content": cleaned[:200], # Preview only
                            "metadata": {"topic": topic, "length": len(cleaned), "compliance": "checked"}
                        }
                        memory.log_ingestion(valid_data)
                        
            logger.info("Harvest Cycle Complete.")
        except Exception as e:
            logger.error(f"Harvest Cycle Error: {e}")

harvester = ContentHarvester()
