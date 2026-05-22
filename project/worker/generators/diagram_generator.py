import os
import json
import re
from utils.diagram_engine import diagram_engine
from core.cortex import intelligence

def generate_industrial_diagrams(project_name, vision, requirements, tech_stack, job_id, mermaid_data=""):
    """
    DIAGRAM FIX ENGINE
    Orchestrates AI -> Mermaid -> Kroki -> Image pipeline.
    Step 4: If mermaid_data is provided, skip AI Thinking.
    """
    diagram_dir = os.path.join("storage", "projects", job_id, "diagrams")
    os.makedirs(diagram_dir, exist_ok=True)
    
    results = []
    
    # 🔴 STEP 3 & 4: MERMAID DATA SOURCE
    prompts = [
        { "type": "ER_Diagram", "prompt": "..." },
        { "type": "DFD_Level_0", "prompt": "..." },
        { "type": "DFD_Level_1", "prompt": "..." }
    ]

    # Pre-calculated data from Master Blueprint (Single Shot)
    # master_mermaid expects something like "[MERMAID_START]...[MERMAID_END][MERMAID_START]...[MERMAID_END]"
    pre_matches = re.findall(r"\[MERMAID_START\](.*?)\[MERMAID_END\]", mermaid_data, re.DOTALL) if mermaid_data else []
    
    for i, p in enumerate(prompts):
        try:
            diagram_code = ""
            if i < len(pre_matches):
                diagram_code = pre_matches[i].strip()
                print(f"📦 Using Master Blueprint diagram for {p['type']}")
            
            if not diagram_code:
                # Fallback to AI if no master data
                for attempt in range(1): 
                    response = intelligence.think(p["prompt"])
                    match = re.search(r"\[MERMAID_START\](.*?)\[MERMAID_END\]", response, re.DOTALL)
                    if match:
                        diagram_code = match.group(1).strip()
                        break
            
            if not diagram_code:
                # 🔴 STEP 6: Fallback Diagram
                diagram_code = f"graph TD\n  A[System Startup] --> B[Processing: {p['type']}]\n  B --> C[Data Persistence]\n  C --> D[Result UI]"
                
            # 🔴 STEP 2 & 4: KROKI RENDER (AI -> Mermaid -> Kroki -> Image)
            img_path = diagram_engine.render_mermaid(diagram_code, output_dir=diagram_dir)
            
            if img_path and os.path.exists(img_path) and os.path.getsize(img_path) > 0:
                 PROJECTS_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "backend", "projects"))
                 rel_path = os.path.relpath(img_path, PROJECTS_ROOT).replace("\\", "/")
                 results.append({
                     "type": p["type"],
                     "path": img_path,
                     "url": f"/downloads/{rel_path}"
                 })
            
        except Exception as e:
            print(f"❌ Diagram Generation Failed ({p['type']}): {e}")
            # DO NOT crash
            
    return results
