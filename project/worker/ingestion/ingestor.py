import os
import logging
from typing import Dict, Any
from .document_processor import document_processor
from .image_processor import image_processor
from .code_processor import code_processor
from .archive_processor import archive_processor
from .media_processor import media_processor

logger = logging.getLogger(__name__)

class IngestionManager:
    def determine_type(self, file_path: str) -> str:
        ext = os.path.splitext(file_path)[1].lower()
        if ext in ['.pdf', '.docx', '.pptx']: return 'document'
        if ext in ['.png', '.jpg', '.jpeg', '.bmp', '.gif', '.webp']: return 'image'
        if ext in ['.py', '.js', '.ts', '.html', '.css', '.json', '.md', '.txt', '.java', '.cpp']: return 'code'
        if ext in ['.mp3', '.wav', '.m4a', '.mp4', '.mkv', '.mov', '.avi']: return 'media'
        if ext in ['.zip', '.tar', '.gz']: return 'archive'
        if os.path.isdir(file_path): return 'archive'
        return 'unknown'

    def ingest(self, file_path: str) -> Dict[str, Any]:
        if not os.path.exists(file_path):
            return {"error": "File not found"}
            
        file_type = self.determine_type(file_path)
        logger.info(f"Ingesting {file_type}: {file_path}")
        
        try:
            if file_type == 'document':
                return document_processor.process(file_path)
            elif file_type == 'image':
                return image_processor.process(file_path)
            elif file_type == 'code':
                return code_processor.process(file_path)
            elif file_type == 'media':
                return media_processor.process(file_path)
            elif file_type == 'archive':
                return archive_processor.process(file_path, self)
            
            # Default text fallback
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                return {"type": "text", "content": f.read()}
        except Exception as e:
            return {"type": "error", "error": str(e)}

ingestor = IngestionManager()
