import requests
import os

class TitanReporter:
    """
    Reports progress back to the API Gateway.
    """
    
    GATEWAY_URL = os.environ.get("GATEWAY_API_URL", "http://localhost:7000")

    @staticmethod
    def log(project_id, message, status=None, current_step=None, artifacts=None):
        """
        Sends a log/status update to the gateway.
        """
        if not project_id or project_id == "temp_titan":
            print(f"📡 [LocalLog]: {message}")
            return
            
        url = f"{TitanReporter.GATEWAY_URL}/api/collage-project/{project_id}/update-status"
        payload = {
            "log": message
        }
        if status: payload["status"] = status
        if current_step: payload["currentStep"] = current_step
        if artifacts: payload["artifacts"] = artifacts
        
        try:
            # Internal authentication via system key
            headers = {
                "x-system-key": os.environ.get("SYSTEM_INTERNAL_KEY", "titan_internal_secret_2024")
            }
            
            response = requests.patch(url, json=payload, headers=headers, timeout=5)
            if response.status_code != 200:
                print(f"⚠️ Failed to report to gateway: {response.status_code}")
        except Exception as e:
            print(f"⚠️ Reporter Error: {str(e)}")

reporter = TitanReporter()
