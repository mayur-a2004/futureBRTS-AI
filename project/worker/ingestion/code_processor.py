import os
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class CodeProcessor:
    def process(self, file_path: str) -> Dict[str, Any]:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            ext = os.path.splitext(file_path)[1]
            return {
                "type": "code",
                "language": ext,
                "content": content,
                "loc": len(content.splitlines())
            }
        except Exception as e:
            logger.error(f"Code Processing Error: {e}")
            return {"type": "code", "error": str(e)}

code_processor = CodeProcessor()
