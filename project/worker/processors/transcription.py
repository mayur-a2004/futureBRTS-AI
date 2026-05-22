# import whisper (Lazy loaded)
from utils.logger import get_logger

logger = get_logger(__name__)

# Initialize model lazy
_whisper_model = None

def get_model():
    global _whisper_model
    if not _whisper_model:
        try:
            import whisper
            # "base" model is small and fast.
            _whisper_model = whisper.load_model("base")
        except Exception as e:
            logger.error(f"Failed to load Whisper: {e}")
            raise
    return _whisper_model

def transcribe(audio_path: str) -> str:
    try:
        model = get_model()
        result = model.transcribe(audio_path)
        return result["text"]
    except ImportError:
         return "[Error: openai-whisper not installed]"
    except Exception as e:
        logger.error(f"Transcription failed: {e}")
        return f"[Error: Transcription Failed - {e}]"
