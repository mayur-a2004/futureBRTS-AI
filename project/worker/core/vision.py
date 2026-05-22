import os
from PIL import Image
import logging

logger = logging.getLogger(__name__)

from services.config_service import config

class TitanVision:
    """
    Legendary Vision Layer: The 'Eyes' of FutureBRTS.
    Uses Gemini 1.5 Flash for high-speed, high-accuracy image understanding.
    """
    def __init__(self):
        self.current_key = None
        self.model = None

    def _sync_key(self):
        new_key = config.get("GEMINI_API_KEY")
        if new_key and new_key != self.current_key:
            try:
                import google.generativeai as genai  # Lazy import - startup pe hang nahi karega
                genai.configure(api_key=new_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash-latest')
                self.current_key = new_key
                logger.info("Titan Vision Linked: Legendary Eyes Synchronized (Dynamic).")
            except Exception as e:
                logger.error(f"Failed to configure Gemini with new key: {e}")

    def see(self, image_path: str = None, prompt: str = "Analyze this image and explain its architectural logic, UI elements, and human reality factor.") -> str:
        """
        Interprets an image OR just processes a prompt if no image is provided.
        """
        self._sync_key()
        
        if not self.model:
            return "Vision Engine Offline: Please provide GEMINI_API_KEY in Admin Panel."

        try:
            import google.generativeai as genai  # noqa
            if image_path:
                if not os.path.exists(image_path):
                    return f"Vision Error: Image not found at {image_path}"
                img = Image.open(image_path)
                response = self.model.generate_content([prompt, img])
            else:
                # Text-only generation if no image
                response = self.model.generate_content(prompt)
            
            return response.text

        except Exception as e:
            logger.error(f"Vision Processing Failed: {e}")
            return f"Strategic Vision Failure: {str(e)}"

# Singleton Eyes
eyes = TitanVision()
