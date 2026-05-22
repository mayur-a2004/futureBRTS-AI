from processors.transcription import transcribe
from utils.logger import get_logger

logger = get_logger(__name__)

def run(file_path: str, command_info: dict) -> dict:
    logger.info(f"Running Audio Pipeline for {file_path}")
    
    extracted_text = transcribe(file_path)
    
    return {
        "extracted_text": extracted_text,
        "result": {
            "pipeline": "audio",
            "transcription_length": len(extracted_text)
        }
    }
