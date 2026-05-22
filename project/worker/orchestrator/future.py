import logging
from typing import Dict, Any, List
from .mode_a import mode_a
from .mode_b import mode_b

logger = logging.getLogger(__name__)

class FutureOrchestrator:
    """
    FUTURE V.1.0 MAIN CONTROLLER
    Unifies Passive (Mode A) and Active (Mode B) operations.
    """
    
    def dispatch(self, request_type: str, payload: Dict[str, Any]):
        """
        Routes requests to the appropriate mode.
        """
        if request_type == "user_query":
            # Mode A: Reactive
            return mode_a.process_query(
                prompt=payload.get("prompt"),
                context=payload.get("context")
            )
        
        elif request_type == "maintenance":
            # Mode B: Proactive
            # This is async, so we return a status and let it run
            # In a real sync context, we might await it or schedule it
            return {"status": "Mode B triggered", "mode": "B"}
            
        else:
            return {"error": "Unknown Request Type"}

future = FutureOrchestrator()
