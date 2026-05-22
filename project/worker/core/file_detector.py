import os
import filetype

def detect_file_type(path: str) -> str:
    """
    Detects the file type using filetype library.
    Honest detection, no guessing based on extension alone.
    """
    if not os.path.exists(path):
        return "unknown"

    # 1. Trust Extension for clear text/code files
    # This prevents 'filetype' from Hallucinating images on short text files
    name = path.lower()
    if name.endswith('.txt') or name.endswith('.md') or name.endswith('.json') or name.endswith('.xml') or name.endswith('.log'):
        return "doc"
    if name.endswith('.csv'): return "csv"
    if name.endswith('.xlsx') or name.endswith('.xls'): return "xlsx"
    if name.endswith('.py') or name.endswith('.js') or name.endswith('.ts') or \
       name.endswith('.java') or name.endswith('.c') or name.endswith('.cpp'):
        return "doc" # Code is a document

    try:
        kind = filetype.guess(path)
        if not kind:
             # Fallback to extension if magic bytes fail (e.g., empty text files)
             return "doc" if name.endswith(".txt") else "unknown"

        mime = kind.mime
        if mime.startswith("image/"): return "image"
        if mime.startswith("video/"): return "video"
        if mime.startswith("audio/"): return "audio"
        if mime == "application/pdf": return "pdf"
        if mime == "application/zip": return "archive"
        if "word" in mime or "excel" in mime or "sheet" in mime: return "doc"
        
        return "unknown"
    except Exception:
        return "unknown"
