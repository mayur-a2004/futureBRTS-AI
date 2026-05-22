import requests
import json
import time

def test_worker():
    url = "http://localhost:8000/execute"
    
    payload = {
        "job_id": "test_gen_001",
        "file_path": "c:/Users/Admin/.gemini/antigravity/futurebuilderlatest/project/worker/requirements.txt", # Use a real file
        "command": "Analyze this structure deeply",
        "session_id": "sess_001"
    }
    
    print("SENDING REQUEST...")
    try:
        res = requests.post(url, json=payload, timeout=300) # Long timeout for "Brain"
        print(f"STATUS: {res.status_code}")
        print("RESPONSE:")
        print(json.dumps(res.json(), indent=2))
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    test_worker()
