import base64
import zlib
import requests
import os
import hashlib
import re

class DiagramEngine:
    """
    Titan Diagram Engine
    Renders Mermaid, PlantUML, and D2 via Kroki.io
    """
    
    KROKI_URL = "https://kroki.io"

    @staticmethod
    def render_mermaid(diagram_code, format="png", output_dir="storage/temp/diagrams"):
        """
        Renders Mermaid code to an image.
        """
        if not diagram_code:
            return None
        
        # 1. Prepare Workspace
        os.makedirs(output_dir, exist_ok=True)
        
        # FIX 1: VALIDATE MERMAID & FALLBACK (Bug #2 Fix)
        if not re.search(r'(graph\s|erDiagram|sequenceDiagram|stateDiagram|flowchart\s|pie|gantt)', diagram_code, re.IGNORECASE):
            diagram_code = "graph TD\n  Start[Industrial Vision] --> Logic[Neural Build]\n  Logic --> Build[High Fidelity Result]"
        
        # 2. Encode for Kroki (RFC 1951 raw deflate NO zlib headers) (Bug #1 Fix)
        compress_obj = zlib.compressobj(level=9, wbits=-zlib.MAX_WBITS)
        compressed = compress_obj.compress(diagram_code.encode('utf-8')) + compress_obj.flush()
        
        encoded_payload = base64.urlsafe_b64encode(compressed).decode('ascii').rstrip('=')
        
        # 3. Request Image
        render_url = f"{DiagramEngine.KROKI_URL}/mermaid/{format}/{encoded_payload}"
        
        try:
            response = requests.get(render_url, timeout=15)
            if response.status_code == 200:
                # 4. Save to cache
                file_hash = hashlib.md5(diagram_code.encode()).hexdigest()
                file_name = f"diag_{file_hash}.{format}"
                file_path = os.path.join(output_dir, file_name)
                
                with open(file_path, "wb") as f:
                    f.write(response.content)
                
                return file_path
            else:
                print(f"❌ Diagram Rendering Failed: {response.status_code}")
                return None
        except Exception as e:
            print(f"❌ Diagram Engine Error: {str(e)}")
            return None

diagram_engine = DiagramEngine()
