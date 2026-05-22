import logging
import hashlib
from typing import Optional
from storage.memory import memory
from acquisition.search_client import search_client
from acquisition.scraper import scraper
from acquisition.cleaner import cleaner
from rag.retriever import retriever
from rag.context_builder import context_builder
from rag.answer_synthesizer import synthesizer
from local_models.model_runner import local_llm

logger = logging.getLogger(__name__)

class HybridFallbackManager:
    """
    Orchestrates the Hybrid Intelligent AI Pipeline.
    Cache -> Remote -> Local RAG
    """
    
    def get_cache_hash(self, prompt: str) -> str:
        return hashlib.md5(prompt.strip().lower().encode()).hexdigest()

    def check_cache(self, prompt: str) -> Optional[str]:
        # Utilizing existing TitanMemory for caching
        patterns = memory.recall_patterns(prompt[:50])
        for p in patterns:
            if p.get("command") == prompt:
                return p.get("summary")
        return None

    def execute_local_rag(self, prompt: str) -> str:
        """
        Final Fallback: Retrieval Augmented Generation
        """
        logger.info("CORE: Remote APIs failed. Activating Local RAG Pipeline...")
        
        # 1. Retrieval
        results = retriever.retrieve(prompt)
        
        # 2. Knowledge Gap Check & Acquisition
        if not results or results[0]["score"] < 0.6:
            logger.info("Knowledge Gap Detected. Triggering Acquisition Layer...")
            search_results = search_client.search(prompt, max_results=2)
            for res in search_results:
                link = res.get("href")
                if link:
                    raw_text = scraper.scrape_url(link)
                    text = cleaner.clean(raw_text)
                    if len(text) > 100:
                        retriever.add(text[:5000], metadata={"source": link})
            
            # Re-query after acquisition
            results = retriever.retrieve(prompt)

        # 3. Answering
        context = context_builder.build_context(results)
        
        if not local_llm.is_loaded:
            # Emergency fallback if Local LLM isn't loaded
            return f"Strategic Insight (Local): Regarding '{prompt}', our knowledge base indicates: {context[:500]}..."

        return synthesizer.synthesize(prompt, context)

fallback_manager = HybridFallbackManager()
