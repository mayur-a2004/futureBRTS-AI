from typing import Literal

class LLMRouter:
    def route(self, engine_status: dict) -> Literal["groq", "gemini", "local"]:
        """
        Determines the optimal AI engine based on system health.
        """
        if engine_status.get("groq", False):
            return "groq"
        if engine_status.get("gemini", False):
            return "gemini"
        return "local"

llm_router = LLMRouter()
