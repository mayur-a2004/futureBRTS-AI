import requests
import time
import os
import json
import uuid

# Configuration
API_URL = "http://localhost:7001/api"  # Node Backend
WORKER_TEST_FILES_DIR = "test_data_rough_tough"

def log(step, msg, status="INFO"):
    symbols = {"INFO": "ℹ️", "SUCCESS": "✅", "WAIT": "⏳", "FAIL": "❌", "DB": "🗄️", "PY": "🐍", "AI": "🤖"}
    print(f"{symbols.get(status, '')} [{step}] {msg}")

def create_dummy_files():
    if not os.path.exists(WORKER_TEST_FILES_DIR):
        os.makedirs(WORKER_TEST_FILES_DIR)
    
    # 1. Image (We can't easily create a real valid JPG textually, so we might skip upload of binary if strict validation exists, 
    # but let's try a text file masked as .txt for Doc pipeline and a command for Generation)
    
    # 2. Homework Doc
    with open(f"{WORKER_TEST_FILES_DIR}/college_essay.txt", "w") as f:
        f.write("Artificial Intelligence is cool but Python is the real MVP. " * 50)
        
    return f"{WORKER_TEST_FILES_DIR}/college_essay.txt"

def simulate_flow(file_path, command, test_name):
    print(f"\n🚀 STARTING TEST: {test_name}")
    log("USER", f"Student uploads {os.path.basename(file_path)} saying: '{command}'")
    
    # 1. UPLOAD (Node Layer)
    url = f"{API_URL}/upload"
    files = {'file': open(file_path, 'rb')}
    data = {'command': command, 'sessionId': f"session_{uuid.uuid4()}"}
    
    try:
        start_time = time.time()
        res = requests.post(url, files=files, data=data)
        
        if res.status_code != 201:
            log("NODE", f"Upload Failed: {res.text}", "FAIL")
            return
        
        job_data = res.json()
        job_id = job_data['job_id']
        log("NODE", f"File received. Saved to Disk. Job Created: {job_id}", "SUCCESS")
        
        # 2. POLLING (Simulating Frontend waiting for DB updates)
        log("DB", "Waiting for Python Component...", "WAIT")
        
        status = "processing"
        final_result = None
        
        while status in ["processing", "pending"]:
            time.sleep(1) # Wait 1s
            status_res = requests.get(f"{API_URL}/jobs/{job_id}")
            if status_res.status_code == 200:
                state = status_res.json()
                status = state['status']
                if status == "completed":
                    final_result = state
                    break
                elif status == "failed":
                    err_msg = state.get('error') or state.get('error_message')
                    log("PY", f"Worker Failed: {err_msg}", "FAIL")
                    return
            else:
                 log("API", "Failed to check status", "FAIL")
                 return
                 
            if time.time() - start_time > 60:
                log("TIMEOUT", "System took too long!", "FAIL")
                return

        # 3. ANALYSIS COMPLETED
        duration = round(time.time() - start_time, 2)
        log("PY", f"Processing Finished in {duration}s", "SUCCESS")
        log("DB", "Metadata & Results Saved.", "SUCCESS")
        
        # 4. REVIEW OUTPUT
        result_blob = final_result.get('result', {})
        extracted = final_result.get('extracted_text', '')[:100] + "..."
        
        print("\n--- 🔍 DEEP INSPECTION REPORT ---")
        print(f"📂 Stored Path: {final_result.get('file_path')}")
        print(f"🧠 Detected Type: {final_result.get('file_type')}")
        print(f"📝 Extracted Text Preview: {extracted}")
        print(f"📊 ML Confidence: {final_result.get('confidence', 'N/A')}")
        if 'deep_analysis' in result_blob:
            print(f"🧐 Deep Layer: {json.dumps(result_blob['deep_analysis'], indent=2)}")
        print("---------------------------------\n")

    except Exception as e:
        log("CRASH", f"Test Exception: {e}", "FAIL")

def simulate_generation(command, test_name):
    """
    Simulates the Generation flow (No file upload, just command)
    We need to check if our API supports this. 
    Currently upload.controller.ts expects a file. 
    We might need to fix the Node Layer to allow 'command-only' inputs if we want pure generation via API.
    OR we upload a dummy placeholder file to trigger it.
    """
    print(f"\n🚀 STARTING TEST: {test_name}")
    log("USER", f"Student asks: '{command}'")
    
    # Create dummy file to pass multer validation
    dummy_path = f"{WORKER_TEST_FILES_DIR}/magic_wand.txt"
    with open(dummy_path, "w") as f: f.write("trigger")
    
    simulate_flow(dummy_path, command, test_name)


if __name__ == "__main__":
    txt_file = create_dummy_files()
    
    # Test 1: Document Analysis
    simulate_flow(txt_file, "Bro read this essay and tell me if its smart", "DOC_ANALYSIS_FLOW")
    
    # Test 2: Generation (Image)
    simulate_generation("generate a cyberpunk image of a cat", "IMG_GEN_FLOW")
    
    # Test 3: Roadmap Generation (Deep Structure)
    simulate_generation("create a deep roadmap for learning Python", "ROADMAP_GEN_FLOW")
    
    # Cleanup
    # os.remove(txt_file)
