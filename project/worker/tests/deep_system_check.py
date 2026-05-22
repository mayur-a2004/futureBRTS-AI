import requests
import json
import time

WORKER_URL = "http://localhost:8000/execute"

def log(msg, status="INFO"):
    print(f"[{status}] {msg}")

def test_generation_pipeline():
    """
    Test 1: Does the Generator Module work?
    Expected: Status 'completed', file path generated, confidence score present.
    """
    log("Testing Generation Pipeline...")
    payload = {
        "job_id": "test_gen_002",
        "command": "generate futuristic image of a city",
        "session_id": "test_session"
    }
    
    try:
        start = time.time()
        res = requests.post(WORKER_URL, json=payload)
        end = time.time()
        
        if res.status_code == 200:
            data = res.json()
            # Now we check 'result_preview'
            preview = data.get("result_preview", {})
            if data["status"] == "completed" and "image" in preview.get("type", ""):
                 log(f"✅ Generation Success in {round(end-start, 2)}s", "PASS")
                 print(f"   Ref: {preview.get('generated_file')}")
            else:
                 log(f"Generation Failed: {data}", "FAIL")
        else:
             log(f"HTTP Error: {res.status_code}", "FAIL")
    except Exception as e:
        log(f"Connection Failed: {e}", "CRITICAL")

def test_deep_analysis_intent():
    """
    Test 2: Does the Command Parser and Deep Layer routing work?
    """
    log("Testing Deep Analysis Logic (Simulated)...")
    payload = {
        "job_id": "test_resilience_002",
        "file_path": "/tmp/non_existent_file.txt", 
        "command": "analyze deeply",
        "session_id": "test_session"
    }
    
    try:
        res = requests.post(WORKER_URL, json=payload)
        if res.status_code == 200:
            data = res.json()
            # If status is completed (because we handled error gracefully), check if result contains error
            preview = data.get("result_preview", {})
            if data["status"] == "completed" or data["status"] == "failed":
                if "error" in preview or data["status"] == "failed":
                     log(f"✅ Resilience Verified: System caught the error. Status: {data['status']}", "PASS")
                else: 
                     log(f"⚠️ Warning: Task completed but should have errored? Preview: {preview}", "WARN")
            else:
                log(f"Unexpected State: {data['status']}", "WARN")
        else:
            log(f"Worker Crashed? Status: {res.status_code}", "FAIL")
    except Exception as e:
        log(f"Connection Failed: {e}", "CRITICAL")

if __name__ == "__main__":
    print("========================================")
    print("   Future BRTS: DEEP SYSTEM DIAGNOSTIC")
    print("========================================")
    test_generation_pipeline()
    print("----------------------------------------")
    test_deep_analysis_intent()
    print("========================================")
