from utils.logger import get_logger

logger = get_logger(__name__)

def parse_command(command_text: str) -> dict:
    """
    Parses the user command to identify the actionable task.
    This is a simple deterministic parser (Rule-based), NOT AI.
    """
    if not command_text:
        return {"action": "process", "output_format": "default"}
    
    cmd_lower = command_text.lower()
    
    # OCR rules
    if "ocr" in cmd_lower or "extract text" in cmd_lower or "read this" in cmd_lower:
        return {"action": "ocr", "output_format": "text"}
    
    # Summary rules
    if "summary" in cmd_lower or "summarize" in cmd_lower or "saar" in cmd_lower:
        return {"action": "summary", "output_format": "text"}
    
    # Conversion rules
    if "convert" in cmd_lower:
        if "pdf" in cmd_lower:
             return {"action": "convert", "target": "pdf"}
        if "gujarati" in cmd_lower:
             return {"action": "translate", "target": "gu"}
        # Add more determinism as needed
    
    # Archive rules
    if "zip" in cmd_lower or "archive" in cmd_lower:
        return {"action": "archive", "format": "zip"}

    # Default fallback
    return {"action": "analyze", "output_format": "default"}
