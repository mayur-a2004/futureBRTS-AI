import os
import sys
import json
import time
import uuid
import traceback
from http.server import HTTPServer, BaseHTTPRequestHandler

# Standard Python Titan Execution Worker on Port 8000
HOST = "127.0.0.1"
PORT = 8000

class PythonWorkerHandler(BaseHTTPRequestHandler):
    def _send_response(self, status_code, data):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def do_OPTIONS(self):
        self._send_response(200, {"status": "OK"})

    def do_GET(self):
        if self.path == '/health' or self.path == '/':
            self._send_response(200, {
                "status": "ONLINE",
                "service": "Future BRTS Python Titan Worker Engine",
                "python_version": sys.version,
                "port": PORT
            })
        else:
            self._send_response(404, {"error": "Not Found"})

    def do_POST(self):
        if self.path in ['/execute', '/api/execute']:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length).decode('utf-8')
            
            try:
                payload = json.loads(post_data) if post_data else {}
                task_id = payload.get('taskId') or payload.get('job_id') or str(uuid.uuid4())
                task_type = payload.get('taskType') or 'python_execution'
                command = payload.get('command') or payload.get('prompt') or ''
                metadata = payload.get('metadata') or {}

                print(f"[Python Worker] Executing Job: {task_id} | Type: {task_type}")

                extracted_text = ""
                summary = "Processed successfully by Python Titan Worker."
                result_data = {}

                # 1. Process Attachment / File Extraction
                file_path = metadata.get('file_path') or payload.get('file_path')
                if file_path and os.path.exists(file_path):
                    ext = os.path.splitext(file_path)[1].lower()
                    if ext in ['.txt', '.py', '.json', '.md', '.csv']:
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            extracted_text = f.read(15000)
                    else:
                        extracted_text = f"File {os.path.basename(file_path)} received and indexed."

                # 2. Python Code Dynamic Execution Mode
                code = metadata.get('code') or payload.get('code')
                if code:
                    try:
                        exec_globals = {}
                        exec(code, exec_globals)
                        result_data['globals'] = str(list(exec_globals.keys()))
                    except Exception as exec_err:
                        result_data['exec_error'] = str(exec_err)

                response_payload = {
                    "status": "SUCCESS",
                    "job_id": task_id,
                    "taskType": task_type,
                    "summary": summary,
                    "extracted_text": extracted_text or f"Python 3.12 processed task: {command[:100]}",
                    "result": {
                        "file_path": file_path or "N/A",
                        "status": "completed",
                        "download_url": metadata.get('download_url') or "/uploads/generated_output.bin",
                        "details": result_data
                    }
                }
                self._send_response(200, response_payload)

            except Exception as e:
                print(f"[Python Worker Error] {traceback.format_exc()}")
                self._send_response(500, {
                    "status": "FAIL",
                    "reason": str(e),
                    "traceback": traceback.format_exc()
                })
        else:
            self._send_response(404, {"error": "Endpoint not found"})

def run_server():
    server = HTTPServer((HOST, PORT), PythonWorkerHandler)
    print(f"[Python Worker] Future BRTS Python Worker running on http://{HOST}:{PORT}")
    server.serve_forever()

if __name__ == '__main__':
    run_server()
