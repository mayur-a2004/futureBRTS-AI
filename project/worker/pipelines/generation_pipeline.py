from generators.pdf_generator import pdf_generator
from utils.logger import get_logger

logger = get_logger(__name__)

def run(command_info: dict, text_content: str = ""):
    """
    Pipeline to generate documents/PDFs from text.
    Handles 'Translation' if requested.
    """
    logger.info("Starting Document Generation Pipeline")
    
    target_lang = command_info.get("target_lang", "en")
    output_format = command_info.get("output_format", "pdf")
    
    # 1. Translate if needed
    final_text = text_content
    if target_lang != "en" and target_lang is not None:
        logger.info(f"Translating to {target_lang}")
        final_text = pdf_generator.translate_text(text_content, target_lang)
    
    # 2. Generate PDF
    if output_format == "pdf":
        output_filename = f"generated_{target_lang}_{pd_random_id()}.pdf"
        file_path = pdf_generator.create_pdf(final_text, output_filename)
        
        if file_path:
            return {
                "extracted_text": f"Generated PDF content: {final_text[:100]}...",
                "result": {
                    "file_path": file_path,
                    "download_url": f"http://localhost:8000/download/{output_filename}",
                    "content_preview": final_text
                },
                "status": "completed"
            }
    
    return {"status": "failed", "error": "Unsupported generation format"}

def pd_random_id():
    import uuid
    return str(uuid.uuid4())[:8]
