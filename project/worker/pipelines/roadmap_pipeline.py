import logging
import os
import json
from core.cortex import intelligence
from ml.architect_core import architect
from acquisition.youtube_analyzer import youtube_analyzer
from rich.console import Console

logger = logging.getLogger(__name__)
console = Console()

def run(command_info: dict, chat_context: str = "", metadata: dict = None):
    """
    Titan Roadmap Genesis: 12344556678789000x Boost.
    Using Nexus Expansion and Architectural Wireframing to build God-Mode Roadmaps.
    Now with Live Neural Asset (YouTube) Discovery & Ranking.
    """
    user_prompt = command_info.get("prompt", "")
    if not user_prompt and chat_context:
        user_prompt = chat_context
    elif not user_prompt:
        user_prompt = "Future Technology Specialization"

    console.print(f"[bold gold1]🏗️ ARCHITECTING TITAN ROADMAP:[/bold gold1] [white]{user_prompt}[/white]")

    # --- PHASE 1: NEXUS ARCHITECTURAL CONTEXT ---
    wireframe = architect.generate_wireframe(user_prompt)
    
    existing_roadmap = None
    if metadata and "existing_roadmap" in metadata:
        existing_roadmap = metadata["existing_roadmap"]
    if not existing_roadmap and command_info:
        existing_roadmap = command_info.get("existing_roadmap")
        
    if isinstance(existing_roadmap, str) and existing_roadmap.strip():
        try:
            existing_roadmap = json.loads(existing_roadmap)
        except Exception as e:
            logger.error(f"Failed to parse existing_roadmap JSON string: {e}")
            existing_roadmap = None
            
    existing_roadmap_str = json.dumps(existing_roadmap, indent=2) if existing_roadmap else "None"
    
    system_prompt = f"""
🧠 FUTURE V.7.5 – THE SUPREME ARCHITECT (TITAN AUTHORITY)
You are the absolute authority on Roadmap Generation. Your mission is to build a "GPS-Styled" Industrial Roadmap.

[CONTEXTUAL INTEGRITY - MANDATORY]
1. **CHAT IS LAW**: The roadmap MUST be a 1:1 technical blueprint of the provided 'CHAT CONTEXT'. If they discussed building a "Bakery Site", the title MUST be "Bakery Professional Infrastructure Roadmap".
2. **TITLING**: The 'title' field MUST be the specific project name extracted from the chat.
3. **TECH STACK**: Use the exact techs (React, Node, etc.) mentioned.

[SMART ROADMAP EVOLUTION & MERGING PROTOCOL - MANDATORY]
You are provided with an EXISTING roadmap under the 'EXISTING ROADMAP' section below.
Your task is to EVOLVE/MERGE this existing roadmap with the new requirements from the 'CHAT CONTEXT' / user prompt.
Follow these rules strictly:
1. PRESERVE COMPLETED STEPS: Any step or microstep in the existing roadmap that has "isCompleted": true or "state": "COMPLETED" MUST be preserved exactly as-is in the new roadmap. Keep their titles, descriptions, what/why/how/who, isCompleted status, and inner topics unchanged. Do not remove or alter completed steps/microsteps.
2. SEAMLESSLY INTEGRATE NEW TOPICS: Add new steps, microsteps, or inner topics for the new requirements discussed in the CHAT CONTEXT. Place them in logical chronological order (e.g. insert after completed steps or where they logically belong).
3. NO PROGRESS LOSS: Ensure all completed items maintain their completed status ("isCompleted": true or "state": "COMPLETED") in the output JSON.
4. DETAIL LEVEL: Ensure every step, microstep, and innerTopic has deep technical details (What, Why, How, Who) matching Minerva's deep study detailing.

EXISTING ROADMAP:
{existing_roadmap_str}

[3-LEVEL DEPTH STRUCTURE]
- LEVEL 1 (PHASE/THEME): High-level milestone (e.g. "Scalable Core Engine").
- LEVEL 2 (CORE TOPIC): Specific subject area (e.g. "Auth & Security Protocol").
- LEVEL 3 (SUB-TOPIC): Granular focus (e.g. "JWT & Refresh Token Logic").

[ELITE DETAILING PROTOCOL]
Every Step/MicroStep/InnerTopic MUST contain:
- **WHAT**: Concrete technical definition.
- **WHY**: The architectural justification (Why this tech? Why now?).
- **HOW**: Detailed implementation command or logic.
- **WHO**: Target Persona/Role (e.g. "Fullstack Developer").

OUTPUT ARCHITECTURE (STRICT JSON):
{{
    "title": "Industrial Roadmap Title",
    "description": "Deep Strategic Context based on Persona",
    "userPersona": "STUDENT | PROFESSIONAL | BUSINESS | PHD",
    "estimatedDays": number,
    "steps": [
        {{
            "stepNumber": number,
            "phase": "PHASE NAME",
            "title": "Step Title (Level 1)",
            "what": "What this milestone achieves",
            "why": "Why this milestone is critical",
            "how": "Macro execution path",
            "who": "Target Role",
            "microSteps": [
                {{ 
                    "title": "Tactical Topic (Level 2)", 
                    "what": "...", "why": "...", "how": "...", "who": "...",
                    "difficulty_level": 1-5,
                    "timeEstimate": "e.g. 4 Hours",
                    "youtubeLink": "Auto-filled",
                    "innerTopics": [
                        {{ "title": "Sub-Topic (Level 3)", "what": "...", "why": "...", "how": "...", "who": "..." }}
                    ]
                }}
            ]
        }}
    ]
}}
"""

    try:
        # 1. AI THINKING
        res_text = intelligence.think(user_prompt, system_message=system_prompt, force_json=True)
        console.print(f"[bold magenta]DEBUG: Raw AI Response:[/bold magenta] {res_text[:200]}...")
        
        if not res_text or len(res_text) < 10:
             logger.error("AI returned empty response for Roadmap.")
             raise ValueError("Empty AI Response")
        
        # Robust JSON cleaning
        clean_json = res_text.strip()
        if "```json" in clean_json:
            clean_json = clean_json.split("```json")[1].split("```")[0].strip()
        
        roadmap_json = json.loads(clean_json)
        
        # 2. NEURAL ASSET UPGRADES (YouTube Ranking)
        console.print("[cyan]🔍 Syncing Neural Assets (YouTube Ranking in Parallel)...[/cyan]")
        import concurrent.futures

        def sync_mstep(mstep):
            topic = mstep.get("title")
            if topic:
                assets = youtube_analyzer.find_best_playlist(topic, {"context": roadmap_json.get("title", ""), "type": "playlist"})
                if assets and len(assets) > 0:
                    mstep["youtubeLink"] = assets[0]["url"]
                    mstep["learningResources"] = assets
                    return topic
            return None

        # Gather all microsteps
        all_msteps = []
        for phase in roadmap_json.get("steps", []):
            for mstep in phase.get("microSteps", []):
                all_msteps.append(mstep)

        # Execute in parallel (Max 5 workers to avoid rate limits/spam)
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            results = list(executor.map(sync_mstep, all_msteps))
            found_count = len([r for r in results if r])
            console.print(f"  [green]✔ Found {found_count} High-Fidelity Assets across {len(all_msteps)} micro-steps.[/green]")
        
        # Inject Intelligence Meta
        roadmap_json["engine"] = "Titan-Nexus-V7-YouTube-Live"
        roadmap_json["fidelity"] = "Supreme_Legend"

        return {
            "status": "completed",
            "result": roadmap_json,
            "extracted_text": f"Titan Roadmap Build: {roadmap_json.get('title')}"
        }

    except Exception as e:
        logger.error(f"Titan Roadmap Genesis Failed: {e}")
        return {"status": "failed", "error": str(e)}
