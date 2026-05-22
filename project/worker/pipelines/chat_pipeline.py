import logging
import json
import os
from core.cortex import intelligence
from core.vision import eyes
from rich.console import Console

logger = logging.getLogger(__name__)
console = Console()

def run(config, prompt_data):
    """
    Titan Global Chat Pipeline: The 'Universal Brain' of the platform.
    Handles Chat, Logic, Multi-modal files, and Human Reality.
    """
    prompt = prompt_data or config.get("prompt", "")
    image_path = config.get("file_path") if config.get("file_type") == "image" else None
    
    console.print(f"[bold gold1]🌌 UNIVERSAL NEURAL SYNC:[/bold gold1] [white]{prompt[:100]}...[/white]")
    
    # 1. BRAIN THINKING (With Visual Context if exists)
    response = intelligence.think(prompt, image_path=image_path)
    
    # 2. LEGEND METADATA EXTRACTION
    # We guide the response to include [SUMMARY] and [SUGGESTIONS] as standard
    if "[SUMMARY]" not in response:
        console.print("[dim]Injecting Legend Metadata...[/dim]")
        meta_prompt = f"Summarize this AI response into one line [SUMMARY] and provide 3 followup [SUGGESTIONS]: {response[:500]}..."
        meta_res = intelligence.think(meta_prompt, system_message="Extract metadata for User UI.")
        response += f"\n\n{meta_res}"

    return {
        "status": "completed",
        "extracted_text": response,
        "result": {
            "answer": response,
            "engine": "FutureBRTS-Global-V5",
            "fidelity": "Supreme-Legend"
        }
    }
