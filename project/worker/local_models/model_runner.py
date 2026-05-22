import logging
from .model_loader import model_loader

logger = logging.getLogger(__name__)

class LocalLLMRunner:
    def __init__(self, model_id: str = "gpt2"): # Standard small fallback
        self.model_id = model_id
        self.pipe = None
        self.is_loaded = False

    def load(self):
        try:
            self.pipe = model_loader.load_pipeline(self.model_id)
            if self.pipe:
                self.is_loaded = True
                logger.info("Local LLM Synchronized.")
        except Exception as e:
            logger.error(f"Local LLM Load Failure: {e}")

    def generate(self, prompt: str, context: str = "") -> str:
        if not self.is_loaded:
            return "Local LLM Offline. Please load model."
        
        full_input = f"CONTEXT: {context}\n\nUSER: {prompt}\n\nASSISTANT:"
        try:
            res = self.pipe(full_input, max_new_tokens=200, num_return_sequences=1)
            return res[0]['generated_text'].split("ASSISTANT:")[-1].strip()
        except Exception as e:
            return f"Generation Error: {e}"

local_llm = LocalLLMRunner()
