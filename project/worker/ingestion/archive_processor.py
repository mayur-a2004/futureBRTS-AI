import os
import logging
import zipfile
import tarfile
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class ArchiveProcessor:
    def process(self, file_path: str, ingestor_ref) -> Dict[str, Any]:
        """
        Recursively processes archives and folders.
        Requires a reference to the main ingestor to process extracted files.
        """
        results = {
            "type": "archive",
            "source": file_path,
            "files": [],
            "content_summary": ""
        }
        
        try:
            # Handle ZIP
            if zipfile.is_zipfile(file_path):
                with zipfile.ZipFile(file_path, 'r') as zip_ref:
                    # Extract to a temp dir (in a real app, use tempfile)
                    extract_path = file_path + "_extracted"
                    zip_ref.extractall(extract_path)
                    results["files"] = self._process_directory(extract_path, ingestor_ref)
            
            # (Tar logic omitted for brevity, focusing on ZIP/Folders)
            
            # Determine content summary
            results["content_summary"] = f"Archive extracted with {len(results['files'])} processed items."
        except Exception as e:
            logger.error(f"Archive Processing Error: {e}")
            results["error"] = str(e)
            
        return results

    def _process_directory(self, dir_path: str, ingestor) -> List[Dict]:
        processed_items = []
        for root, _, files in os.walk(dir_path):
            for file in files:
                full_path = os.path.join(root, file)
                # Avoid recursive loops if extraction location is inside
                try:
                    item_data = ingestor.ingest(full_path)
                    processed_items.append(item_data)
                except Exception as e:
                    logger.warning(f"Failed to ingest extracted item {file}: {e}")
        return processed_items

archive_processor = ArchiveProcessor()
