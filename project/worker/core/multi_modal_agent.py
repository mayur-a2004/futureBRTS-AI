from typing import List, Dict, Any, Optional
import os
import logging
import json
from .cortex import brain
from ingestion.ingestor import ingestor
from router.fallback_manager import fallback_manager
from storage.memory import memory
from rag.retriever import retriever

logger = logging.getLogger(__name__)

class MultiModalAgent:
    """
    Titan Multi-Modal Agent: Handles text, files, and complex reasoning layers.
    """
    
    def process_request(self, prompt: str, file_paths: List[str] = []) -> Dict[str, Any]:
        context = ""
        ingested_data = []

        # 1. INGESTION PHASE
        for path in file_paths:
            if os.path.exists(path):
                data = ingestor.ingest(path)
                ingested_data.append(data)
                
                # Add to Vector DB for immediate recall
                content_str = data.get("content") or data.get("ocr_text") or str(data)
                if len(content_str) > 50:
                    retriever.add(content_str[:5000], metadata={"source": path})
                    context += f"[FILE: {os.path.basename(path)}]\n{content_str[:1500]}\n...\n"
                
                # DB LOGGING
                memory.log_ingestion(data)

        # 2. RETRIEVAL PHASE (RAG)
        # Fetch relevant past knowledge to augment current context
        rag_hits = retriever.retrieve(prompt)
        rag_context = "\n".join([f"- {h['content'][:300]}" for h in rag_hits])
        
        full_prompt = f"""
        [CONTEXTUAL MEMORY]
        {rag_context}
        
        [CURRENT INGESTION ({len(ingested_data)} files)]
        {context}
        
        [USER REQUEST]
        {prompt}
        
        [SYSTEM PROTOCOL]
        1. IDENTITY: You are a Multi-Modal Hybrid Worker.
        2. BEHAVIOR: Route to Groq -> Gemini -> Local. Ground answer in [CONTEXTUAL MEMORY].
        3. OUTPUT: If the user asks for analysis/code, return JSON. If chat, return text.
        4. JSON FORMAT (if applicable): {{ "summary": "...", "insights": [...], "source": "groq|gemini|local" }}
        """

        # 3. REASONING & GENERATION (Routing: Groq -> Gemini -> Local)
        try:
            # Heuristic: If prompt contains "analyze", "report", "extract", "json", force JSON mode
            force_json = any(k in prompt.lower() for k in ["analyze", "report", "json", "extract", "structure"])
            
            response = brain.intelligence.think(full_prompt, force_json=force_json)
            
            # 4. PERSISTENCE (Mongo Metadata)
            memory.store_experience(prompt, response[:500], metadata={
                "files": len(file_paths), 
                "rag_hits": len(rag_hits),
                "mode": "hybrid_agent"
            })
            
            return {
                "status": "success",
                "response": response,
                "ingested_files": len(ingested_data),
                "rag_used": len(rag_hits) > 0,
                "format": "json" if force_json else "text"
            }
        except Exception as e:
            logger.error(f"Agent Processing Failed: {e}")
            # Final Safety Net: Local Fallback
            local_res = fallback_manager.execute_local_rag(prompt)
            return {
                "status": "fallback",
                "response": local_res,
                "error": str(e)
            }

agent = MultiModalAgent()
