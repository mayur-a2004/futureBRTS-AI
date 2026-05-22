import logging
import asyncio
import random
import json
import os
import torch
from datetime import datetime
from typing import Dict, Any, List

from core.cortex import brain
from local_models.model_runner import local_llm as model_runner
from training.dataset_builder import dataset_builder
from rag.retriever import retriever
from storage.memory import memory
from .config import config

logger = logging.getLogger(__name__)

class PipelineOrchestrator:
    """
    FUTURE V.1.0 - FULL PIPELINE ORCHESTRATOR (END-TO-END)
    Executes the 10-Stage Training Pipeline (Teachers -> Student -> SFT/DPO -> RAG -> Eval).
    """

    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Pipeline Orchestrator initialized on {self.device.upper()}")

    async def run_pipeline_cycle(self, user_prompt: str = None):
        """
        Executes a single end-to-end training data generation cycle.
        """
        cycle_id = f"cycle_{int(datetime.now().timestamp())}"
        logger.info(f"[{cycle_id}] ACTIVATING PIPELINE CYCLE on {self.device.upper()}...")

        # STAGE 1: QUERY GENERATION
        if user_prompt:
            prompt = user_prompt
            domain = "user_generated"
            profile = "user"
        else:
            prompt, domain, profile = self._generate_synthetic_query()
        
        logger.info(f"[{cycle_id}] S1: Query [{domain}/{profile}] -> {prompt[:40]}...")

        try:
            # STAGE 2: TEACHER COLLECTION
            logger.info(f"[{cycle_id}] S2: Asking Teacher (Cloud)...")
            teacher_output = brain.intelligence.think(prompt) 

            # STAGE 3: STUDENT ATTEMPT
            logger.info(f"[{cycle_id}] S3: Asking Student (Local)...")
            student_output = model_runner.generate(prompt)

            # STAGE 4: SFT CORPUS BUILDING
            logger.info(f"[{cycle_id}] S4: Logging SFT Data...")
            sft_entry = {
                "prompt": prompt,
                "response": teacher_output,
                "metadata": {
                    "source": f"teacher_pipeline_{domain}",
                    "domain": domain,
                    "timestamp": datetime.now().isoformat()
                }
            }
            dataset_builder.log_sft_sample(
                prompt=prompt, 
                teacher_output=teacher_output, 
                source=f"teacher_pipeline_{domain}"
            )

            # STAGE 5: DPO CORPUS BUILDING
            dpo_entry = None
            if teacher_output and student_output and teacher_output != student_output:
                logger.info(f"[{cycle_id}] S5: Logging DPO Data...")
                dpo_entry = {
                    "prompt": prompt,
                    "chosen": teacher_output,
                    "rejected": student_output,
                    "metadata": {
                        "source": f"dpo_pipeline_{domain}",
                        "timestamp": datetime.now().isoformat()
                    }
                }
                dataset_builder.log_dpo_pair(
                    prompt=prompt,
                    chosen=teacher_output,
                    rejected=student_output,
                    source=f"dpo_pipeline_{domain}"
                )

            # STAGE 6: RAG MEMORY INGEST
            logger.info(f"[{cycle_id}] S6: RAG Ingestion...")
            rag_chunks = self._ingest_into_rag(teacher_output, prompt, domain)

            # STAGE 7: EVALUATION LOOP
            logger.info(f"[{cycle_id}] S7: Running Training Evaluation...")
            eval_metrics = self._evaluate_detailed(teacher_output, student_output)
            
            # STAGE 8: TRAINING TRIGGERS
            trigger_status = self._check_training_triggers()
            
            # STAGE 9: LOGGING & METADATA
            # Construct the FULL COMPLIANCE OBJECT required by the new System Prompt
            full_result = {
                "queries": [{"prompt": prompt, "domain": domain, "difficulty": "intermediate", "user_profile": profile}],
                
                "teacher_requests": [{
                    "prompt": prompt,
                    "teacher_target": ["gemini", "groq"],
                    "expected_format": "text",
                    "status": "completed",
                    "visual_proof": teacher_output[:50] + "..." if teacher_output else None
                }],
                
                "student_requests": [{
                    "prompt": prompt,
                    "student_target": "local_model",
                    "mode": "inference",
                    "status": "completed",
                    "visual_proof": student_output[:50] + "..." if student_output else None
                }],
                
                "sft_records": [sft_entry],
                "dpo_records": [dpo_entry] if dpo_entry else [],
                
                "rag_chunks": [{
                    "chunk": c["chunk"],
                    "embedding_request": True,
                    "metadata": c["metadata"]
                } for c in rag_chunks],
                
                "embedding_tasks": [{
                    "text": c["chunk"][:50] + "...",
                    "vector_target": "rag_memory",
                    "status": "queued"
                } for c in rag_chunks],
                
                "evaluation_tasks": [{
                    "prompt": prompt,
                    "teacher_ref": "available",
                    "student_ref": "available",
                    "criteria": ["semantic", "correctness", "reasoning", "readability", "factual_grounding"],
                    "result": eval_metrics
                }],
                
                "train_trigger": "yes" if trigger_status['sft_ready'] or trigger_status['dpo_ready'] else "no",
                "notes": f"Cycle {cycle_id} completed on {self.device}. Score: {eval_metrics['final_grade']}"
            }
            
            logger.info(f"[{cycle_id}] Cycle Complete. Final Grade: {eval_metrics['final_grade']}")
            return full_result

        except Exception as e:
            logger.error(f"[{cycle_id}] Pipeline Failure: {e}", exc_info=True)
            return {"status": "failed", "error": str(e)}

    def _generate_synthetic_query(self):
        """Generates diverse prompts based on config domains."""
        domain = random.choice(config.DOMAINS)
        profile = random.choice(config.USER_PROFILES)
        difficulty = random.choice(config.DIFFICULTY_LEVELS)
        
        # In a real system, these would be templates or LM-generated
        templates = [
            f"As a {profile}, explain the core concepts of {domain} at a {difficulty} level.",
            f"Create a detailed roadmap for {domain} suitable for a {profile}.",
            f"Write a {difficulty} level python script for {domain} tasks.",
            f"Analyze the current trends in {domain} for a {profile}."
        ]
        return random.choice(templates), domain, profile

    def _ingest_into_rag(self, content: str, source_prompt: str, domain: str) -> List[Dict]:
        """Ingests content chunks with rich metadata and returns them."""
        chunks = [content[i:i+800] for i in range(0, len(content), 800)]
        rag_data = []
        for chunk in chunks:
            row = {
                "chunk": chunk,
                "metadata": {
                    "source_query": source_prompt,
                    "domain": domain,
                    "timestamp": datetime.now().isoformat(),
                    "source": "teacher_pipeline"
                }
            }
            retriever.add(row["chunk"], metadata=row["metadata"])
            rag_data.append(row)
        return rag_data

    def _evaluate_detailed(self, teacher_text: str, student_text: str) -> Dict[str, Any]:
        """
        Produces the detailed evaluation object required by the spec.
        """
        if not student_text: student_text = ""
        
        # Heuristic Scoring (Placeholders for real NLP metrics)
        t_len = len(teacher_text)
        s_len = len(student_text)
        
        # Semantic Score (mock: word overlap)
        t_words = set(teacher_text.split())
        s_words = set(student_text.lower().split())
        overlap = len(t_words.intersection(s_words))
        semantic_score = round(overlap / len(t_words) if t_words else 0, 2)
        
        # Formatting Score (mock: structure check)
        formatting_score = 1.0 if "\n" in student_text and len(student_text) > 50 else 0.5
        
        # Reasoning Score (mock: length ratio, assuming teacher is ideal length)
        ratio = min(s_len / t_len if t_len > 0 else 0, 1.2)
        reasoning_score = min(ratio, 1.0)
        
        final_grade = int((semantic_score + formatting_score + reasoning_score) / 3 * 100)
        
        return {
            "semantic_score": semantic_score,
            "correctness_score": semantic_score, # Proxy
            "reasoning_score": reasoning_score,
            "formatting_score": formatting_score,
            "rag_support": True,
            "final_grade": final_grade
        }

    def _check_training_triggers(self) -> Dict[str, Any]:
        """Checks if SFT or DPO datasets have reached the trigger size."""
        sft_count = 0
        dpo_count = 0
        
        if os.path.exists(dataset_builder.sft_path):
            with open(dataset_builder.sft_path, 'r', encoding='utf-8') as f:
                sft_count = sum(1 for _ in f)
                
        if os.path.exists(dataset_builder.dpo_path):
            with open(dataset_builder.dpo_path, 'r', encoding='utf-8') as f:
                dpo_count = sum(1 for _ in f)
                
        return {
            "sft_ready": sft_count >= config.SFT_TRIGGER_SIZE,
            "dpo_ready": dpo_count >= config.DPO_TRIGGER_SIZE,
            "current_sft": sft_count,
            "current_dpo": dpo_count
        }

pipeline_orchestrator = PipelineOrchestrator()
