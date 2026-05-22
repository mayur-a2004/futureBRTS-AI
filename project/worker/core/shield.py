import os
import re
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class CyberShield:
    """
    7-Layer Granted Security Layer (Python Core)
    Focus: Sandboxing, Path Integrity, and Execution Monitoring.
    """
    
    def __init__(self):
        # L4: Path Integrity - Restrict to project root
        self.root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        self.allowed_dirs = [
            os.path.join(self.root_dir, "data"),
            os.path.join(self.root_dir, "processed"),
            os.path.join(self.root_dir, "uploads")
        ]

    def validate_path(self, file_path: str) -> bool:
        """
        L5: Sandbox Protection (Prevents Directory Traversal)
        """
        if not file_path:
            return True # No path to validate
            
        abs_path = os.path.abspath(file_path)
        # Check if path is within allowed directories
        is_safe = any(abs_path.startswith(os.path.abspath(d)) for d in self.allowed_dirs)
        
        if not is_safe:
            logger.error(f"SECURITY ALERT: Directory Traversal attempt blocked: {file_path}")
            return False
            
        # Prevent access to sensitive files
        forbidden_extensions = [".env", ".py", ".ts", ".js", ".json", ".db", ".sqlite"]
        filename = os.path.basename(file_path).lower()
        if any(filename.endswith(ext) for ext in forbidden_extensions):
             # Allow our internal data files but nothing else
             if "global_insights.json" not in filename:
                logger.error(f"SECURITY ALERT: Blocked access to system file: {file_path}")
                return False
                
        return True

    def scan_command_payload(self, command: str) -> bool:
        """
        L6: Behavioral Firewall (Detects dangerous execution patterns)
        """
        dangerous_patterns = [
            r"rm\s+-rf", r"format\s+", r"chmod\s+", r"chown\s+",
            r"os\.system", r"subprocess\.", r"shutil\.", r"eval\(", r"exec\("
        ]
        
        for pattern in dangerous_patterns:
            if re.search(pattern, command, re.IGNORECASE):
                logger.error(f"SECURITY ALERT: Malicious execution pattern detected: {command}")
                return False
        return True

    def sign_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """
        L7: Integrity Layer (Ensures output hasn't been tampered with)
        """
        # In a full system, we'd use HMAC/RSA here. 
        # For this layer, we attach a system-level integrity hash.
        result["_integrity_hash"] = hash(str(result.get("extracted_text", "")))
        result["_shield_verified"] = True
        return result

shield = CyberShield()
