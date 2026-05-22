import os

def validate_file_path(path: str) -> bool:
    if not path:
        return False
    return os.path.exists(path)

def validate_job_id(job_id: str) -> bool:
    return bool(job_id and len(job_id) > 0)
