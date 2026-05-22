import logging
import json
from core.cortex import intelligence
from ml.ml_core import science_core
from rich.console import Console

logger = logging.getLogger(__name__)
console = Console()

def run(payload, prompt=None):
    """
    Titan Task Verification (God Mode).
    Uses recursive logic and scientific verification to judge task outcomes.
    """
    questions = payload.get("questions", [])
    user_results = payload.get("results", [])
    submission = payload.get("submission", "")
    verification_type = payload.get("type", "VIVA_MCQ")
    
    console.print(f"[bold gold1]⚖️ JUDGING TASK INTEGRITY:[/bold gold1] [white]{verification_type}[/white]")

    # --- PHASE 1: TITAN JUDGMENT PROMPT ---
    judgment_prompt = f"""
    You are the Supreme Global Auditor.
    [SEMANTIC INTENT VERIFICATION PROTOCOL]
    
    1. **Language Neutrality**: The user may answer in Hindi, English, Gujarati, or Hinglish. IGNORE the language. FOCUS ON THE TECHNICAL LOGIC.
    2. **Logic Extraction**: Extract the "Truth Nodes" from the user submission. If the core concepts (e.g., 'closure', 'middleware', 'big-O') match the Expected Truth, mark it CORRECT.
    3. **Truth Factor**: Compare against these Expected Truths: {json.dumps(questions)}
    4. **Anti-Cheat**: If the submission is a verbatim copy of a public snippet without original logic, flag it.
    
    SUBMISSION: {submission if submission else json.dumps(user_results)}
    
    Return JSON: {{ 
        "isPassed": boolean, 
        "score": number, 
        "results": [{{ "questionId": "...", "isCorrect": boolean, "suggestion": "Correct logic in user's context..." }}], 
        "message": "Feedback in detected language context...",
        "skillGapDetected": "string (specific technical gap if failed)"
    }}
    """

    try:
        # Use intelligence engine for judgment
        raw_judgment = intelligence.think(judgment_prompt, "You are the Supreme Human-Reality Judge.")
        
        # Parse result
        clean_json = raw_judgment.strip()
        if "```json" in clean_json: clean_json = clean_json.split("```json")[1].split("```")[0].strip()
        
        eval_data = json.loads(clean_json)
        
        # Inject Science Proof
        eval_data["fidelity"] = "Supreme_Legend"
        eval_data["proof"] = science_core.symbolic_proof(f"({eval_data.get('score', 0)})")

        return {
            "status": "completed",
            "result": eval_data,
            "extracted_text": f"Task Evaluation: {eval_data.get('message')}"
        }

    except Exception as e:
        logger.error(f"Titan Verification Failed: {e}")
        # Lightweight fuzzy fallback (old logic)
        from fuzzywuzzy import fuzz
        return {"status": "completed", "result": {"isPassed": False, "score": 0, "message": "Neural Evaluation Snafu - Retrying..."}}
