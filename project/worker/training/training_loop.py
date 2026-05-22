import logging
import random
from core.cortex import brain
from local_models.model_runner import model_runner
from .dataset_builder import dataset_builder

logger = logging.getLogger(__name__)

class TrainingLoop:
    """
    FUTURE V.1.0 TRAINING LOOP (SFT/DPO)
    Orchestrates the 'Teacher-Student' training cycle.
    """
    
    def run_eval_cycle(self, prompt: str):
        """
        Generates DPO data by comparing Teacher (Cloud) vs Student (Local).
        """
        try:
            # 1. Get Teacher Output (Groq/Gemini) - The "Chosen" response
            teacher_res = brain.intelligence.think(prompt)
            
            # 2. Get Student Output (Local LLM) - The "Rejected" response (for now, assuming it's weaker)
            # In a real DPO loop, we'd score them, but here we assume Teacher > Student initially
            student_res = model_runner.generate(prompt)
            
            # 3. Log DPO pair if they are different enough
            if len(teacher_res) > 20 and len(student_res) > 20:
                dataset_builder.log_dpo_pair(
                    prompt=prompt,
                    chosen=teacher_res,
                    rejected=student_res,
                    source="eval_cycle"
                )
                logger.info("DPO Pair Generated via Training Loop.")
                
            return {
                "status": "success",
                "teacher_len": len(teacher_res),
                "student_len": len(student_res)
            }
        except Exception as e:
            logger.error(f"Training Loop Failed: {e}")
            return {"status": "failed", "error": str(e)}

training_loop = TrainingLoop()
