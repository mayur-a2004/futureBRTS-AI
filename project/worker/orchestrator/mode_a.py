import logging
import asyncio
from typing import Dict, Any, List

from core.cortex import brain
from storage.memory import memory
from router.fallback_manager import fallback_manager
from rag.retriever import retriever

logger = logging.getLogger(__name__)

# --- ADVANCED SYSTEM TRAINING (IN-MEMORY IDENTITY) ---
# This prompt "trains" the model's behavior for every request without altering core files.
IDENTITY_MATRIX = """
YOU ARE 'FUTURE V.1.0' — THE HYBRID AI ORCHESTRATOR.
Your mission is to aid the user in building, coding, and designing with "Supreme Fidelity".

[BEHAVIORAL DNA]
1. PROFESSIONALISM: Output clean, structured, and academic-grade responses.
2. FORMATTING: Use Markdown strictly. Code blocks must have language tags (e.g., ```python).
3. CLARITY: No fluff. Go straight to the solution. Explain "Why", then show "How".
4. HONESTY: If you don't know, use the available tools or say so. Never hallucinate.
5. CONTEXT AWARENESS: Always ground your answers in the provided [CONTEXT] if available.

[OUTPUT RULES]
- For Code: Provide full, working snippets. Do not leave "..." placeholders unless the code is massive.
- For Explanations: Use bullet points and bold text for key concepts.
- For Analysis: Return structured JSON if requested (Mode 3).

[ERROR HANDLING]
- If a tool fails, suggest an alternative.
- If the user is frustrated, pivot to a simpler approach.
"""

class ModeA_Orchestrator:
    """
    FUTURE V.1.0 - PASSIVE ORCHESTRATOR
    Responsible for human-facing interactions, reasoning, and routing.
    Aggregates RAG Context + System Training for every call.
    """
    
    def process_query(self, prompt: str, context: str = "") -> Dict[str, Any]:
        """
        Executes the Mode-A Reasoning Pipeline.
        Routing: Groq -> Gemini -> Local
        """
        # 1. RETRIEVAL (RAG) - Augment with Long-Term Memory
        # Retrieve top 3 relevant chunks from vector store to "train" the answer on facts
        rag_hits = retriever.retrieve(prompt, top_k=3)
        rag_context = "\n".join([f"> {h['content'][:500]}" for h in rag_hits])
        
        full_system_prompt = IDENTITY_MATRIX
        if rag_context:
            full_system_prompt += f"\n\n[LONG-TERM MEMORY / KNOWLEDGE BASE]\n{rag_context}"
            
        full_user_prompt = f"{prompt}"
        if context:
            full_user_prompt += f"\n\n[CURRENT CONTEXT]\n{context}"
        
        logger.info(f"Mode-A: Processing Query with RAG ({len(rag_hits)} hits)")

        # 2. Primary & Secondary Routing (Handled by Cortex.think)
        try:
            # We override the default system message with our "Training" prompt
            response = brain.intelligence.think(
                prompt=full_user_prompt, 
                system_message=full_system_prompt,
                force_json=False
            )
            
            # [TRAINING ORCHESTRATOR]
            # Capture this Teacher Output as a Golden Sample for SFT
            from training.dataset_builder import dataset_builder
            dataset_builder.log_sft_sample(prompt=prompt, teacher_output=response, source="groq/gemini")
            
            return {
                "mode": "A",
                "source": "hybrid_cloud", 
                "content": response
            }
        except Exception as e:
            logger.warning(f"Mode-A Cloud Failure: {e}. Activating Local Fallback.")
            
        # 3. Tertiary Fallback (Local)
        try:
            # Fallback manager creates its own emergency context
            local_res = fallback_manager.execute_local_rag(prompt)
            return {
                "mode": "A",
                "source": "local",
                "content": local_res
            }
        except Exception as e:
            logger.error(f"Mode-A CRITICAL Failure: {e}")
            return {
                "mode": "A",
                "source": "local",
                "content": "**SYSTEM ERROR:** The neural core is unresponsive. Please check the logs."
            }

mode_a = ModeA_Orchestrator()
