import os
import shutil
import zipfile
import tarfile
import uuid
from pipelines import folder_pipeline
from typing import Dict, Any

TEMP_DIR = str(os.path.join(os.getcwd(), "temp_archives")) # Absolute path safety

def run(archive_path: str, command_info: Dict[str, Any]) -> Dict[str, Any]:
    """
    Archive Pipeline (Zip/Tar/Gz).
    Extracts -> Analyzes via Folder Pipeline -> Cleans up.
    "Nothing left behind" approach.
    """
    if not os.path.exists(TEMP_DIR):
        os.makedirs(TEMP_DIR)

    # Create a unique extraction folder
    extract_path = os.path.join(TEMP_DIR, f"extract_{uuid.uuid4()}")
    os.makedirs(extract_path)

    extracted_success = False
    
    try:
        # 1. Extraction Logic
        if zipfile.is_zipfile(archive_path):
            with zipfile.ZipFile(archive_path, 'r') as zip_ref:
                zip_ref.extractall(extract_path)
            extracted_success = True
            
        elif tarfile.is_tarfile(archive_path):
            with tarfile.open(archive_path, 'r') as tar_ref:
                tar_ref.extractall(extract_path)
            extracted_success = True
        else:
            return {
                "extracted_text": "Error: Unsupported archive format.",
                "result": {"error": "Invalid format"}
            }

        # 2. Analyze Contents (Reuse Folder Pipeline for maximum efficiency)
        if extracted_success:
            # Recursively analyze the extracted folder
            folder_result = folder_pipeline.run(extract_path, command_info)
            
            # Enrich the result
            folder_result["result"]["archive_source"] = os.path.basename(archive_path)
            
            # Modify extracted text to reflect it was an archive
            folder_result["extracted_text"] = f"[ARCHIVE EXTRACTED: {os.path.basename(archive_path)}]\n" + folder_result["extracted_text"]
            
            return folder_result

    except Exception as e:
        return {
            "extracted_text": f"Error processing archive: {str(e)}",
            "result": {"error": str(e)}
        }
        
    finally:
        # 3. Cleanup (Strict Hygiene)
        if os.path.exists(extract_path):
            try:
                shutil.rmtree(extract_path)
            except:
                pass # Best effort cleanup

    return {"extracted_text": "Archive processing failed.", "result": {"status": "failed"}}

def create_archive(files: list, params: dict = {}) -> dict:
    from rich.console import Console
    console = Console()
    console.print(f"[bold yellow]📦 ZIP ARCHIVE TRIGGERED[/bold yellow]")
    
    if not files:
        return {"status": "failed", "error": "No files provided to zip."}

    output_dir = "storage/projects/archives"
    os.makedirs(output_dir, exist_ok=True)
    filename = f"archive_{os.urandom(4).hex()}.zip"
    output_path = os.path.join(output_dir, filename)
    download_url = f"/downloads/archives/{filename}"

    try:
        with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            count = 0
            for file_path in files:
                if os.path.exists(file_path):
                    # Add file to zip, preserving basename
                    zipf.write(file_path, arcname=os.path.basename(file_path))
                    count += 1
                else:
                    console.print(f"[red]Warning: File not found for zip: {file_path}[/red]")
            
        if count == 0:
             return {"status": "failed", "error": "No valid files found to zip."}

        return {
            "status": "completed",
            "extracted_text": f"Archive created with {count} files.",
            "result": {
                "file_path": output_path,
                "download_url": download_url,
                "file_count": count
            }
        }
    except Exception as e:
        return {"status": "failed", "error": str(e)}
