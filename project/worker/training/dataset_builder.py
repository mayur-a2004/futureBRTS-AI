import logging
import json
import os
from datetime import datetime
from typing import Dict, Any
from storage.memory import memory

logger = logging.getLogger(__name__)

class DatasetBuilder:
    """
    FUTURE V.1.0 DATASET BUILDER
    Orchestrates the creation of SFT (Supervised Fine-Tuning) and DPO (Direct Preference Optimization) datasets.
    """
    
    def __init__(self):
        self.sft_path = "storage/datasets/sft_corpus.jsonl"
        self.dpo_path = "storage/datasets/dpo_corpus.jsonl"
        # Ensure directories exist
        os.makedirs("storage/datasets", exist_ok=True)
        
    def log_sft_sample(self, prompt: str, teacher_output: str, source: str = "hybrid"):
        """
        Logs a high-quality interaction as a training sample for the local student model.
        """
        sample = {
            "prompt": prompt,
            "teacher_output": teacher_output,
            "metadata": {
                "source_model": source,
                "timestamp": datetime.now().isoformat(),
                "type": "SFT"
            }
        }
        self._append_to_file(self.sft_path, sample)
        memory.log_ingestion({"type": "training_sample", "source": "chat", "metadata": sample["metadata"]})

    def log_dpo_pair(self, prompt: str, chosen: str, rejected: str, source: str = "hybrid"):
        """
        Logs a preference pair (Winner vs Loser) for DPO training.
        """
        sample = {
            "prompt": prompt,
            "chosen": chosen,
            "rejected": rejected,
            "metadata": {
                "source_model": source,
                "timestamp": datetime.now().isoformat(),
                "type": "DPO"
            }
        }
        self._append_to_file(self.dpo_path, sample)

    def _append_to_file(self, filepath: str, data: Dict[str, Any]):
        try:
            with open(filepath, "a", encoding="utf-8") as f:
                f.write(json.dumps(data) + "\n")
        except Exception as e:
            logger.error(f"Failed to append to dataset {filepath}: {e}")

dataset_builder = DatasetBuilder()
