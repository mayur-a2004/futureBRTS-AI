import numpy as np
import logging

logger = logging.getLogger(__name__)

class TitanEmbedder:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.model = None  # Lazy load - startup pe block nahi karega
        logger.info(f"Embedder configured (lazy): {model_name}")

    def _load_model(self):
        """Load model on first use (lazy loading)."""
        if self.model is None:
            try:
                from sentence_transformers import SentenceTransformer
                self.model = SentenceTransformer(self.model_name)
                logger.info(f"Embedder Initialized: {self.model_name}")
            except Exception as e:
                logger.error(f"Failed to load embedding model: {e}")
                self.model = "FAILED"

    def embed(self, text: str):
        self._load_model()
        if not self.model or self.model == "FAILED":
            return np.zeros(384)
        return self.model.encode(text)

embedder = TitanEmbedder()
