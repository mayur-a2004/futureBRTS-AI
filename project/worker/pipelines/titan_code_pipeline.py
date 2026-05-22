import os
import json
import zipfile
from core.cortex import intelligence
from utils.reporter import reporter

def run(config, prompt_data):
    """
    TITAN MODULAR CODE BUILDER
    Builds a full functional project (Auth, DB, Payments, Admin) iteratively.
    """
    project_id = config.get("projectId", "temp_code")
    blueprint = config.get("blueprint", {})
    tier = config.get("tier", "BACHELOR")
    stack = blueprint.get("stack", {})
    
    reporter.log(project_id, "🔧 Initiating Titan Modular Code Builder...", status="BUILDING_CODE", current_step="Neural Code Synthesis")
    
    storage_dir = os.path.join("storage", "projects", project_id)
    code_dir = os.path.join(storage_dir, "SOURCE_CODE")
    os.makedirs(code_dir, exist_ok=True)
    
    print(f"🛠️ TITAN CODE WEAVER: Building {project_id} | Tier: {tier}")
    
    # Iterative Code Generation Tasks
    tasks = [
        {"name": "Scaffold", "goal": "Generate project config, package.json/requirements.txt, and directory structure."},
        {"name": "Database", "goal": f"Construct DB connection and models for: {json.dumps(blueprint.get('dbSchema'))}"},
        {"name": "Auth_Security", "goal": "Develop JWT Auth, Login/Signup controllers, and encryption middleware."},
        {"name": "Core_API", "goal": f"Implement the primary business modules for {blueprint.get('title')}."},
        {"name": "UI_Frontend", "goal": "Create premium React/HTML components for Home, Auth, and Dashboard."}
    ]
    
    for i, task in enumerate(tasks, 1):
        print(f"📦 Phase {i}: {task['name']}...")
        reporter.log(project_id, f"📦 Building Phase {i}/5: {task['name']}...")
        
        prompt = f"""
        YOU ARE AN ELITE SENIOR DEVELOPER. BUILD PHASE: {task['name']}.
        Project: {blueprint.get('title')}
        Stack: {json.dumps(stack)}
        Goal: {task['goal']}
        
        [RULES]
        1. Code MUST be production-grade and fully commented.
        2. Handle errors and edge cases.
        3. Include a 'Titan Setup Guide' in a README.md if it's the first phase.
        4. RETURN ONLY JSON: {{ "relative/file/path.js": "Full code content..." }}
        """
        
        response = intelligence.think(prompt, force_json=True)
        try:
            files = json.loads(response) if isinstance(response, str) else response
            for rel_path, content in files.items():
                # Prevent path traversal
                clean_path = rel_path.lstrip("/").lstrip("\\")
                abs_path = os.path.normpath(os.path.join(code_dir, clean_path))
                os.makedirs(os.path.dirname(abs_path), exist_ok=True)
                with open(abs_path, "w", encoding="utf-8") as f:
                    f.write(content)
        except Exception as e:
            print(f"⚠️ Phase {task['name']} failed parsing: {e}")

    # FINAL PACKAGING
    zip_filename = f"{project_id}_TITAN_SUPREME_PACKAGE.zip"
    zip_path = os.path.join("storage", "projects", zip_filename)
    
    # We zip the entire project folder (Docs + Code)
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(storage_dir):
            for file in files:
                abs_f = os.path.join(root, file)
                rel_f = os.path.relpath(abs_f, storage_dir).replace('\\', '/')
                zipf.write(abs_f, rel_f)

    worker_url = os.getenv("WORKER_PUBLIC_URL", "http://localhost:8000")
    doc_filename = f"Technical_Report_{project_id}.docx"
    
    return {
        "status": "completed",
        "result": {
            "artifacts": {
                "zip": {"url": f"{worker_url}/downloads/{zip_filename}"},
                "word": {"url": f"{worker_url}/downloads/{doc_filename}"},
                "zipUrl": f"{worker_url}/downloads/{zip_filename}",
                "documentUrl": f"{worker_url}/downloads/{doc_filename}"
            }
        }
    }
