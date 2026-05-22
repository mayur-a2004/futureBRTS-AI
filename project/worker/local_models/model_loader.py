import logging

logger = logging.getLogger(__name__)

class ModelLoader:
    def load_pipeline(self, model_id: str, task: str = "text-generation", device: str = "cpu"):
        """
        Robustly loads a local LLM pipeline. (Lazy import - startup pe hang nahi karega)
        """
        try:
            from transformers import pipeline  # Lazy import
            logger.info(f"ModelLoader: Initializing {model_id} on {device}...")
            pipe = pipeline(task, model=model_id, device=device)
            logger.info(f"ModelLoader: {model_id} loaded successfully.")
            return pipe
        except Exception as e:
            logger.error(f"ModelLoader Failed: {e}")
            return None

model_loader = ModelLoader()
