import sys
import os
import json
import logging

# Setup Logger
logging.basicConfig(level=logging.INFO)

# Add worker dir to path
sys.path.append(os.path.join(os.getcwd(), 'project', 'worker'))

from project.worker.core.dispatcher import dispatch_task
from project.worker.core.models import WorkerRequest

def test_direct():
    print("--- Testing Dispatcher Direct (Bypassing Uvicorn) ---")
    
    # Mock Request
    req = WorkerRequest(
        job_id="test_direct_001",
        file_path="c:/Users/Admin/.gemini/antigravity/futurebuilderlatest/project/worker/requirements.txt",
        command="Analyze this structure deeply",
        session_id="sess_001"
    )
    
    try:
        result = dispatch_task(req)
        
        print("\n--- RESULT ---")
        print(f"Status: {result.get('status')}")
        print(f"File Type: {result.get('file_type')}")
        
        # Check Brain Activation
        res_meta = result.get("result", {})
        if "metadata" in res_meta:
             print(f"Metadata Rows (Line Count): {res_meta['metadata'].get('line_count')}")
             
        # Check Complexity/Strategy (if injected)
        # Dispatcher doesn't explicitly return strategy in top level, but logs it.
        print("Success!")

    except Exception as e:
        print(f"CRASH: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_direct()
