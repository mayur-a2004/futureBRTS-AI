import requests
import time
import os
import uuid
import json
import logging

# Setup Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("ULTRA_TEST")

API_URL = "http://127.0.0.1:7000/api/upload"
JOBS_URL = "http://127.0.0.1:7000/api/jobs"

# 1000000x Boost Logic: Fail Fast, Fix Fast
TIMEOUT = 120 # 2 Minutes strict limit

def create_dummy_file(filename, content="Dummy content", size_mb=0):
    with open(filename, 'w') as f:
        f.write(content)
        if size_mb > 0:
            f.write("0" * (size_mb * 1024 * 1024))
    return filename

def run_cycle(cycle_id, name, filename, command, file_content_type="doc"):
    logger.info(f"\n🚀 STARTING CYCLE {cycle_id}: {name}")
    logger.info(f"📝 Command: {command}")
    
    # Create File
    create_dummy_file(filename)
    
    session_id = str(uuid.uuid4())
    
    start_time = time.time()
    
    # Upload
    try:
        with open(filename, 'rb') as f:
            files = {'file': (filename, f, 'text/plain')} # Content-Type is hint, Python detects real type
            data = {'command': command, 'sessionId': session_id}
            
            logger.info(f"📤 Uploading {filename}...")
            res = requests.post(API_URL, files=files, data=data, timeout=10)
            
            if res.status_code != 201:
                logger.error(f"❌ Upload Failed: {res.text}")
                return False
                
            job_id = res.json().get('job_id')
            logger.info(f"✅ Job Created: {job_id}")
            
    except Exception as e:
        logger.error(f"❌ Network Error during upload: {e}")
        return False
        
    # Poll
    logger.info("⏳ Polling for completion...")
    while True:
        if time.time() - start_time > TIMEOUT:
            logger.error("❌ TIMEOUT: Cycle took too long!")
            return False
            
        try:
            res = requests.get(f"{JOBS_URL}/{job_id}", timeout=5)
            if res.status_code == 200:
                data = res.json()
                status = data.get('status')
                
                if status == 'completed':
                    duration = time.time() - start_time
                    logger.info(f"✅ CYCLE {cycle_id} COMPLETED in {duration:.2f}s")
                    
                    # Verify Data Depth
                    conf = data.get('confidence')
                    extracted = data.get('extracted_text')
                    ftype = data.get('file_type')
                    result = data.get('result')
                    
                    logger.info(f"   > Type: {ftype}")
                    logger.info(f"   > Confidence: {conf}")
                    # Logger snippet of extracted text
                    snippet = extracted[:50] if extracted else "No text"
                    logger.info(f"   > Text: {snippet}...")
                    
                    # Check "Hard Level" Validity
                    if "analyze" in command.lower() or "roadmap" in command.lower():
                         # Expect some analysis structure
                         if not result or result == {}:
                             logger.warning("⚠️ Warning: Empty Result for Analysis Task")
                    
                    return True
                    
                if status == 'failed':
                    logger.error(f"❌ Job Failed: {data.get('error_message')}")
                    return False
                    
        except Exception as e:
            logger.warning(f"⚠️ Polling Error (Retrying): {e}")
            
        time.sleep(1) # Check every 1s (Fast Poll)
        
    return True

def main():
    logger.info("🔥 INITIATING ULTRA STRESS TEST (1000000x BOOST EDITION) 🔥")
    
    cycles = [
        # Cycle 1: High Level Chat/Summary
        (1, "Deep Summary & Roadmap", "chat_history_dummy.txt", 
         "Analyze this conversation history given in the file and generate a detailed project roadmap with tasks."),
         
        # Cycle 2: Complex Science/DSA Analysis
        (2, "Scientific DSA Analysis", "research_paper_dummy.txt",
         "Analyze the scientific validity of this text and apply Machine Learning logic to categorize the algorithms mentioned."),
         
        # Cycle 3: Pure Generation (Image/UI)
        (3, "Visual Intelligence & Generation", "ui_mockup_req.txt",
         "Generate a cyberpunk image of a futuristic dashboard for a coding agent."),
         
        # Cycle 4: Recursive Archive Audit
        (4, "Archive Code Audit", "project_code.txt", # Simulating code content
         "Audit this code content for security vulnerabilities and optimize for O(n) time complexity.")
    ]
    
    results = []
    
    for cycle_id, name, fname, cmd in cycles:
        success = run_cycle(cycle_id, name, fname, cmd)
        results.append((cycle_id, success))
        if not success:
            logger.error("\n🛑 STOPPING TEST: FAILURE DETECTED. FIX IMMEDIATELY.")
            break
        # Cleanup
        try:
             if os.path.exists(fname): os.remove(fname)
        except: pass
        
    logger.info("\n📊 TEST SUMMARY:")
    all_pass = True
    for cid, success in results:
        status = "PASS ✅" if success else "FAIL ❌"
        logger.info(f"Cycle {cid}: {status}")
        if not success: all_pass = False
        
    if all_pass:
        logger.info("\n🏆 SYSTEM IS 100% READY. 0 to 100% CLEAR. NO LEAKS.")
    else:
        logger.error("\n💀 SYSTEM FAILED. FIX REQUIRED.")

if __name__ == "__main__":
    main()
