from pydantic import BaseModel
from typing import Optional

class VerificationSchema(BaseModel):
    task_id: str
    status: str # PASSED, FAILED
    score: Optional[int] = 0
    feedback: Optional[str] = ""
