import sys
import os
import json
import logging

# Setup Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add worker dir to path
sys.path.append(os.path.join(os.getcwd(), 'project', 'worker'))

# Import the pipeline
from project.worker.pipelines import roadmap_pipeline

def test_roadmap():
    print("--- Testing Deep Roadmap Generation ---")
    
    command = {
        "prompt": "Create a roadmap for becoming a DevOps Engineer."
    }
    
    try:
        result = roadmap_pipeline.run(command)
        
        print("\n--- RESULT ---")
        print(f"Status: {result.get('status')}")
        
        if result.get('status') == 'completed':
            data = result.get('result', {})
            print(f"Title: {data.get('title')}")
            steps = data.get('steps', [])
            print(f"Steps Count: {len(steps)}")
            
            if len(steps) > 0:
                first_step = steps[0]
                print(f"Step 1: {first_step.get('title')}")
                print(f" - MicroSteps: {len(first_step.get('microSteps', []))}")
                print(f" - Is Locked: {first_step.get('isLocked')}") # Should be False
                
            print("\nKeys in Step 1 microSteps[0]:")
            if len(steps) > 0 and len(steps[0].get('microSteps', [])) > 0:
                 print(steps[0]['microSteps'][0].keys())

        else:
            print(f"Error: {result.get('error')}")
            
    except Exception as e:
        print(f"CRASH: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_roadmap()
