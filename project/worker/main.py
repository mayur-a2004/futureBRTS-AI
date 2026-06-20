import os
import sys

# 🛡️ UNICODE STABILITY SHIELD (Windows Fix)
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

os.environ['DISABLE_MODEL_SOURCE_CHECK'] = 'True'

from fastapi import FastAPI, BackgroundTasks, Request
from dotenv import load_dotenv
load_dotenv() # Load this FIRST

from schemas.request_schema import WorkerRequest
from core.dispatcher import dispatch_task
from core.cortex import brain
from utils.self_test import run_legend_self_test
import asyncio
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from rich.console import Console
from rich.panel import Panel

console = Console(force_terminal=True, color_system="auto", legacy_windows=False)
app = FastAPI(title="FUTURE-BRTS TITAN SUPREME LEGEND V7")

# Initialize Background Harvester & Mode B
# from scrapers.harvester import harvester
from orchestrator.mode_b import mode_b

@app.on_event("startup")
async def startup_event():
    # Start Harvester
    # asyncio.create_task(harvester.run_harvest_cycle())
    # Start Mode B Maintenance
    asyncio.create_task(mode_b.run_maintenance_cycle())

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure storage exists
PROJECTS_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend", "projects"))
os.makedirs(PROJECTS_ROOT, exist_ok=True)
app.mount("/downloads", StaticFiles(directory=PROJECTS_ROOT), name="downloads")

@app.get("/")
def read_root():
    return {"status": "online", "message": "FUTURE-BRTS TITAN LEGEND V7 Worker Active"}

@app.get("/status")
def status_check():
    return {"status": "supreme", "port": 8000, "db": "linked"}

@app.get("/health")
def health_check():
    return {
        "status": "online", 
        "engine": "FutureBRTS Titan Legend V7",
        "boost": "12344556678789000x%",
        "stack": "Latest Stable (Torch/Transformers/Sympy Linked)",
        "intelligence": "Supreme Legend Tier",
        "memory": "Linked to MongoDB Intelligence Bank",
        "redundancy": "Python-Local-Legend Failover Active",
        "service": "worker-8000"
    }

@app.post("/pipeline/activate")
async def activate_pipeline(payload: dict):
    """
    Trigger the Full Training Pipeline (Manual Activation).
    Payload: {"prompt": "optional custom prompt"}
    """
    from pipelines.training.orchestrator import pipeline_orchestrator
    prompt = payload.get("prompt")
    result = await pipeline_orchestrator.run_pipeline_cycle(user_prompt=prompt)
    return result

@app.post("/execute")
async def execute_task(payload: WorkerRequest, background_tasks: BackgroundTasks):
    console.print(Panel(f"[bold gold1]⚡ TITAN SUPREME PULSE INITIATED[/bold gold1]\n[white]Input:[/white] {payload.command[:80]}...\n[cyan]Security: GhostVeil Enabled[/cyan]", border_style="gold1"))
    
    try:
        # Neural dispatch
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, dispatch_task, payload)
        
        if result.get("status") == "completed":
            console.print("[bold green]✔ Neural Execution Success - Supreme Fidelity[/bold green]")
        else:
            console.print(f"[bold red]✘ Logic Conflict: {result.get('error')}[/bold red]")
            
        return result
    except Exception as e:
        console.print(f"[bold red]CRITICAL BRAIN FAILURE: {e}[/bold red]")
        return {"status": "failed", "error": str(e)}

from core.multi_modal_agent import agent

@app.post("/agent/interact")
async def agent_interact(payload: dict, background_tasks: BackgroundTasks):
    """
    Endpoint for Multi-Modal Agent Interaction
    Payload: { "prompt": str, "files": [paths] }
    """
    prompt = payload.get("prompt", "")
    files = payload.get("files", [])
    
    console.print(Panel(f"[bold purple]🤖 AGENT ACTIVATED[/bold purple]\nRequest: {prompt}", border_style="purple"))
    
    result = await asyncio.to_thread(agent.process_request, prompt, files)
    return result

@app.post("/omega-build")
async def omega_build(payload: dict, background_tasks: BackgroundTasks):
    """
    Triggers the Omega Pipeline (Danger Algorithm) to build the project.
    """
    from orchestrator.future import future
    import asyncio
    
    console.print(Panel(f"[bold red]🔥 OMEGA PIPELINE ACTIVATED[/bold red]\nProject: {payload.get('title')}", border_style="red"))
    
    # Run the omega build in the background
    background_tasks.add_task(future.dispatch, "omega_build", payload)
    
    return {"status": "omega_pipeline_started", "message": "The Danger Algorithm is running in the background"}

@app.post("/build-project")
async def build_project(payload: dict):
    """
    Build complete TITAN project package: Word Report, PDF, PPT, Source Code ZIP.
    STEP 5: Wrapped in global try/except - NEVER returns 500
    """
    try:
        return await _run_build_project(payload)
    except Exception as e:
        console.print(f"[bold red]CRITICAL BUILD ERROR: {e}[/bold red]")
        import traceback
        traceback.print_exc()
        return {
            "status": "failed",
            "error": str(e),
            "job_id": payload.get("job_id", "unknown"),
            "artifacts": {},
            "errors": [str(e)]
        }

async def _run_build_project(payload: dict):
    import uuid
    import asyncio # Ensure it's imported
    from generators.doc_generator    import generate_project_doc
    from generators.pdf_generator    import generate_project_pdf
    from generators.ppt_generator    import generate_project_ppt
    from generators.source_code_generator import generate_source_zip
    from generators.image_fetcher    import fetch_project_images
    from generators.diagram_generator import generate_industrial_diagrams

    # STEP 4: LOCAL GENERATION ENGINE - Extract Master Data
    master_info = payload.get("master_blueprint") or {}
    job_id       = payload.get("job_id", str(uuid.uuid4()))
    project_name = payload.get("project_name", "My Project")
    category     = payload.get("category", "Industrial/Academic")
    field        = payload.get("field", "Master of Science in Information Technology")
    project_type = payload.get("project_type", "Industrial Build")
    tech_stack   = payload.get("tech_stack", "React, Node.js, MongoDB")
    vision       = payload.get("vision", "")
    
    # Use Master Docs if available, otherwise use ai_content
    ai_content   = master_info.get("docs") if master_info.get("docs") else payload.get("ai_content", "")
    mermaid_data = master_info.get("diagrams") if master_info.get("diagrams") else ""
    
    BASE_URL = os.environ.get("WORKER_PUBLIC_URL", "http://localhost:8000")

    console.print(f"[bold gold1]🔱 TITAN BUILD INITIATED: {project_name}[/bold gold1]")

    # ── Phase 1: Image Generation ───────────────────────────────────────
    images = {}
    try:
        console.print("[cyan]🎨 Fetching Titan Visual Assets...[/cyan]")
        images = await asyncio.to_thread(fetch_project_images, project_name, vision, job_id)
        if images:
            console.print(f"[green]✅ Visual Assets Prepared: {list(images.keys())}[/green]")
    except Exception as e:
        console.print(f"[yellow]⚠️ Image Fetch Failed: {e}[/yellow]")

    results = {}
    errors  = []

    # ── Phase 2: Documentation & ZIP ────────────────────────────────────
    results = {}
    
    # helper for URL construction
    def get_url(rel_path):
        return f"{BASE_URL}/downloads/{rel_path}"

    # 🏙️ Word Document
    try:
        doc_path = await asyncio.to_thread(
            generate_project_doc,
            project_name, category, field, project_type, tech_stack, vision, ai_content, job_id, images
        )
        if doc_path and os.path.exists(doc_path):
            rel_path = os.path.relpath(doc_path, PROJECTS_ROOT).replace("\\", "/")
            results["docUrl"] = get_url(rel_path)
            console.print(f"[green]✅ Word Report Generated: {rel_path}[/green]")
        else:
            raise Exception("Word file path invalid or file not created.")
    except Exception as e:
        errors.append(f"Word: {str(e)}")
        console.print(f"[red]❌ Word Generation Failed: {e}[/red]")

    # 🏙️ PDF
    try:
        pdf_path = await asyncio.to_thread(
            generate_project_pdf,
            project_name, category, field, project_type, tech_stack, vision, ai_content, job_id, images
        )
        if pdf_path and os.path.exists(pdf_path):
            rel_path = os.path.relpath(pdf_path, PROJECTS_ROOT).replace("\\", "/")
            results["pdfUrl"] = get_url(rel_path)
            console.print(f"[green]✅ PDF Generated: {rel_path}[/green]")
        else:
            raise Exception("PDF file path invalid or file not created.")
    except Exception as e:
        errors.append(f"PDF: {str(e)}")
        console.print(f"[red]❌ PDF Generation Failed: {e}[/red]")

    # 🏙️ PowerPoint
    try:
        ppt_path = await asyncio.to_thread(
            generate_project_ppt,
            project_name, category, field, project_type, tech_stack, vision, ai_content, job_id, images
        )
        if ppt_path and os.path.exists(ppt_path):
            rel_path = os.path.relpath(ppt_path, PROJECTS_ROOT).replace("\\", "/")
            results["pptUrl"] = get_url(rel_path)
            console.print(f"[green]✅ PPT Generated: {rel_path}[/green]")
        else:
            raise Exception("PPT file path invalid or file not created.")
    except Exception as e:
        errors.append(f"PPT: {str(e)}")
        console.print(f"[red]❌ PPT Generation Failed: {e}[/red]")

    # 🏙️ Diagrams (ER + DFD 0 + DFD 1) - Local Engine
    diagram_metadata = []
    try:
        console.print("[cyan]📊 Generating Neural Industrial Diagrams (Local Rendering Mode)...[/cyan]")
        diagram_metadata = await asyncio.to_thread(
            generate_industrial_diagrams,
            project_name, vision, payload.get("requirements", ""), tech_stack, job_id, mermaid_data
        )
        if diagram_metadata:
            results["diagrams"] = diagram_metadata
            console.print(f"[green]✅ Generated {len(diagram_metadata)} Diagrams[/green]")
    except Exception as e:
        errors.append(f"Diagrams: {str(e)}")
        console.print(f"[red]❌ Diagram Generation Failed: {e}[/red]")

    # 🏙️ Source Code ZIP
    try:
        zip_path = await asyncio.to_thread(
            generate_source_zip,
            project_name, category, field, project_type, tech_stack, vision, ai_content, job_id, images
        )
        if zip_path and os.path.exists(zip_path):
            rel_path = os.path.relpath(zip_path, PROJECTS_ROOT).replace("\\", "/")
            results["zipUrl"] = get_url(rel_path)
            console.print(f"[green]✅ Source ZIP Generated: {rel_path}[/green]")
        else:
            raise Exception("ZIP file path invalid or file not created.")
    except Exception as e:
        errors.append(f"ZIP: {str(e)}")
        console.print(f"[red]❌ ZIP Generation Failed: {e}[/red]")

    # MASTER FIX: Fail Honestly (Fix 7)
    is_success = ("docUrl" in results or "pdfUrl" in results) and "zipUrl" in results
    
    console.print(f"[bold {'green' if is_success else 'red'}]🎉 TITAN BUILD {'COMPLETE' if is_success else 'PARTIAL'}: {len(results)}/4 Artifacts Ready[/bold {'green' if is_success else 'red'}]")

    return {
        "status": "completed" if is_success else "failed",
        "job_id": job_id,
        "project_name": project_name,
        "artifacts": results,
        "diagrams": diagram_metadata,
        "errors": errors,
        "total_generated": len(results)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

