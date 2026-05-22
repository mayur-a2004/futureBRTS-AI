from pydantic import BaseModel
from typing import Optional, List

class TaskSchema(BaseModel):
    id: str
    type: str # MCQ, CODE, VIVA, LOGIC
    prompt: str
    context: Optional[dict] = {}
