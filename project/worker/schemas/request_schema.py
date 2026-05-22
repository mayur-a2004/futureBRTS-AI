from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class WorkerRequest(BaseModel):
    # New Standard Fields
    job_id: Optional[str] = None
    session_id: Optional[str] = None
    file_path: Optional[str] = None
    original_name: Optional[str] = None
    command: Optional[str] = None
    requested_by: Optional[str] = None
    timestamp: Optional[str] = None

    # Legacy/Fallback Support (so we don't crash instantly if Node sends old format)
    taskId: Optional[str] = None # Map to job_id
    taskType: Optional[str] = None # Map to command/pipeline
    prompt: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
