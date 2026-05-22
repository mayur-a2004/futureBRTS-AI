import os
from core.file_detector import detect_file_type
from typing import Dict, Any

def run(folder_path: str, command_info: Dict[str, Any]) -> Dict[str, Any]:
    """
    Recursively analyzes a folder structure. 
    Returns a summary of contents.
    """
    summary = {
        "total_files": 0,
        "by_type": {},
        "files": [], 
        "structure": []
    }
    
    # extracted_text could be a summary of the folder content
    extracted_text_lines = [f"Folder Analysis for: {os.path.basename(folder_path)}"]

    try:
        for root, _, files in os.walk(folder_path):
            level = root.replace(folder_path, '').count(os.sep)
            indent = ' ' * 4 * (level)
            folder_name = os.path.basename(root)
            summary["structure"].append(f"{indent}{folder_name}/")

            for f in files:
                full_path = os.path.join(root, f)
                ftype = detect_file_type(full_path)

                summary["total_files"] += 1
                summary["by_type"].setdefault(ftype, 0)
                summary["by_type"][ftype] += 1

                file_info = {
                    "name": f,
                    "type": ftype,
                    "path": full_path, 
                    "size": os.path.getsize(full_path)
                }
                summary["files"].append(file_info)
                summary["structure"].append(f"{indent}    - {f} ({ftype})")

        extracted_text_lines.append(f"Total Files: {summary['total_files']}")
        for ftype, count in summary["by_type"].items():
            extracted_text_lines.append(f"- {ftype}: {count}")

    except Exception as e:
        return {
            "extracted_text": "Error scanning folder.",
            "result": {"error": str(e)}
        }

    return {
        "extracted_text": "\n".join(extracted_text_lines),
        "result": summary
    }
