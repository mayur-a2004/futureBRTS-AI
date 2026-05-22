from paddleocr import PaddleOCR
from utils.logger import get_logger

logger = get_logger(__name__)

# Initialize PaddleOCR once (global or singleton pattern)
_ocr_engine = None

def get_ocr_engine():
    global _ocr_engine
    if not _ocr_engine:
        # use_angle_cls=True need for orientation
        try:
            _ocr_engine = PaddleOCR(use_angle_cls=True, lang='en') 
        except Exception as e:
            logger.error(f"Failed to init PaddleOCR: {e}")
            raise
    return _ocr_engine

def run_ocr(image_path: str) -> str:
    """
    Runs OCR on the given image path and returns the full extracted text.
    """
    try:
        engine = get_ocr_engine()
        result = engine.ocr(image_path, cls=True)
        
        full_text = []
        if not result or result[0] is None:
            return ""

        for idx in range(len(result)):
            res = result[idx]
            if res:
                for line in res:
                    # line[1][0] is the text
                    full_text.append(line[1][0])
        
        return "\n".join(full_text)
    except Exception as e:
        logger.error(f"OCR execution failed: {e}")
        return ""
