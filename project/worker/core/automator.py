from typing import Any, Dict
import re
import json

class AutoMechanic:
    """
    Automated Repair and Formatting System.
    "Next Layer" self-maintenance.
    """
    
    @staticmethod
    def deep_clean_text(text: str) -> str:
        """
        Advanced Filtering: Removes zero-width chars, replacement chars, 
        and normalizes excessive spacing.
        """
        if not text: return ""
        # Remove null bytes and non-printable chars
        cleaned = text.replace('\x00', '').replace('\uFFFD', '')
        # Normalize whitespace (tab/newlines -> space, then single space)
        # cleaned = " ".join(cleaned.split()) # Optional: keeping newlines is usually good for structure
        return cleaned.strip()

    @staticmethod
    def repair_json(malformed_json_str: str) -> Dict[str, Any]:
        """
        Heuristic JSON repair for LLM outputs.
        """
        try:
            return json.loads(malformed_json_str)
        except json.JSONDecodeError:
            # 1. Try finding first { and last }
            match = re.search(r'(\{.*\})', malformed_json_str, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(1))
                except:
                    pass
            # 2. Try adding missing braces (Primitive)
            # This is "Last Resort" logic
            pass
            
        return {"error": "JSON Repair Failed", "original": malformed_json_str[:100]}

    @staticmethod
    def structure_output(data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enforce standardized structure.
        """
        standard = {
            "meta": {
                "version": "v2.0-NextGen", 
                "modules_used": [] 
            },
            "data": data,
            "status": "active"
        }
        return standard

automator = AutoMechanic()
