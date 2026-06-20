import logging
from typing import Dict, Any, List
from .mode_a import mode_a
from .mode_b import mode_b

# OMEGA PIPELINE IMPORTS
from ml.architect_core import architect
from core.ast_analyzer import get_analyzer
from rag.vector_store import get_vector_store
from ml.coder_agent import CoderAgent
from ml.reviewer_agent import ReviewerAgent

logger = logging.getLogger(__name__)

class FutureOrchestrator:
    """
    FUTURE V.2.0 MAIN CONTROLLER (Omega Edition)
    Unifies Passive (Mode A), Active (Mode B), and Omega Pipeline builds.
    """
    
    def dispatch(self, request_type: str, payload: Dict[str, Any]):
        """
        Routes requests to the appropriate mode.
        """
        if request_type == "user_query":
            return mode_a.process_query(prompt=payload.get("prompt"), context=payload.get("context"))
        
        elif request_type == "maintenance":
            return {"status": "Mode B triggered", "mode": "B"}
            
        elif request_type == "omega_build":
            # 🚀 OMEGA PIPELINE EXECUTION LOOP
            project_id = payload.get("project_id", "unknown")
            project_reqs = payload.get("requirements", "Build a project")
            workspace_root = payload.get("workspace_root", "/tmp/workspace")
            
            # MongoDB Setup
            from pymongo import MongoClient
            from config.settings import MONGO_URI, DB_NAME
            from bson.objectid import ObjectId
            import datetime
            
            client = MongoClient(MONGO_URI)
            db = client[DB_NAME]
            registries_col = db['fileregistries']
            
            try:
                # Initialize Agents
                ast_analyzer = get_analyzer(workspace_root)
                vector_store = get_vector_store(workspace_root)
                coder = CoderAgent(vector_store, ast_analyzer)
                reviewer = ReviewerAgent()
                
                # STEP 1: Architect plans the Dependency Graph
                dependency_graph = architect.generate_dependency_graph(project_reqs)
                
                build_results = []
                
                # PRE-POPULATE REGISTRY
                if project_id != "unknown":
                    for node in dependency_graph:
                        registries_col.update_one(
                            {"projectId": ObjectId(project_id), "filePath": node["file"]},
                            {"$set": {
                                "status": "pending",
                                "dependsOn": node.get("dependsOn", []),
                                "updatedAt": datetime.datetime.utcnow()
                            }},
                            upsert=True
                        )
                
                # STEP 2: Sequential Generation
                for file_node in dependency_graph:
                    # Mark as generating
                    if project_id != "unknown":
                        registries_col.update_one(
                            {"projectId": ObjectId(project_id), "filePath": file_node["file"]},
                            {"$set": {"status": "generating", "updatedAt": datetime.datetime.utcnow()}}
                        )
                
                    # 2A. Coder writes using FIM + Context Injection
                    generated_code = coder.generate_file(file_node, project_reqs)
                    
                    # 2B. Reviewer validates (Constitutional Check)
                    is_approved, fixed_code, message = reviewer.review_code(generated_code, file_node.get("dependsOn", []))
                    
                    if not is_approved:
                        logger.error(f"Validation Failed for {file_node['file']}: {message}")
                        if project_id != "unknown":
                            registries_col.update_one(
                                {"projectId": ObjectId(project_id), "filePath": file_node["file"]},
                                {"$set": {"status": "error", "errorMessage": message, "updatedAt": datetime.datetime.utcnow()}}
                            )
                        # In a real loop, we would retry or use RLCF Sandbox
                    else:
                        # 2C. Save to Vector Store (RAG) for the next file
                        vector_store.index_file(file_node["file"], fixed_code, exports=["mockExport1", "mockExport2"])
                        
                        if project_id != "unknown":
                            registries_col.update_one(
                                {"projectId": ObjectId(project_id), "filePath": file_node["file"]},
                                {"$set": {"status": "completed", "updatedAt": datetime.datetime.utcnow()}}
                            )
                    
                    build_results.append({
                        "file": file_node["file"],
                        "status": "completed" if is_approved else "error",
                        "code_preview": fixed_code[:100]
                    })
                    
                return {"status": "Omega Pipeline Complete", "results": build_results}
            except Exception as e:
                logger.error(f"Omega Pipeline Error: {e}")
                return {"status": "failed", "error": str(e)}
            
        else:
            return {"error": "Unknown Request Type"}

future = FutureOrchestrator()
