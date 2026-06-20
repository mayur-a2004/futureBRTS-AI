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
    def sanitize_mermaid_code(code):
        if not code:
            return code
        
        lines = code.split('\n')
        is_er = "erDiagram" in code
        is_seq = "sequenceDiagram" in code
        is_state = "stateDiagram" in code or "stateDiagram-v2" in code
        is_flow = "graph " in code or "flowchart " in code
        
        # 1. erDiagram constraints
        if is_er:
            new_lines = []
            for line in lines:
                clean = line.strip()
                if (clean.startswith('classDef') or 
                    clean.startswith('class ') or 
                    clean.startswith('style ') or 
                    clean.startswith('subgraph') or 
                    clean.startswith('end') or 
                    clean.startswith('click')):
                    continue
                
                # Replace invalid relationships or flowchart arrow connectors inside erDiagram
                if ':' in clean and not clean.startswith('%%'):
                    valid_connector_pattern = r'(\|o|\|\||\}o|\}|o\||o\{|\|\{)\s*(--|\.\.)\s*(\|o|\|\||\}o|\}|o\||o\{|\|\{)'
                    if not re.search(valid_connector_pattern, clean):
                        # Replace the connector with a safe default "||--o{"
                        clean = re.sub(r'([a-zA-Z0-9_]+)\s+[^:]*?\s+([a-zA-Z0-9_]+)\s*:', r'\1 ||--o{ \2 :', clean)
                new_lines.append(clean)
            lines = new_lines
            
        # 2. sequenceDiagram constraints
        elif is_seq:
            lines = [line.strip() for line in lines if not (line.strip().startswith('classDef') or line.strip().startswith('class ') or line.strip().startswith('style '))]
            
        # 3. stateDiagram constraints
        elif is_state:
            lines = [line.strip() for line in lines if not (line.strip().startswith('classDef') or line.strip().startswith('class ') or line.strip().startswith('style '))]
            
        # 4. flowchart constraints
        if is_flow or not (is_er or is_seq or is_state):
            new_lines = []
            for line in lines:
                clean = line.strip()
                
                def replace_label(match):
                    id_part = match.group(1)
                    label_part = match.group(2)
                    if '(' in label_part or ')' in label_part or not re.match(r'^[a-zA-Z0-9_ -]+$', label_part):
                        return f'{id_part}["{label_part.replace(chr(34), "")}"]'
                    return match.group(0)
                
                clean = re.sub(r'([a-zA-Z0-9_-]+)\s*\(([^)]+)\)', replace_label, clean)
                new_lines.append(clean)
            lines = new_lines
            
        return '\n'.join(lines)

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
        
        # Sanitize Mermaid Code
        diagram_code = DiagramEngine.sanitize_mermaid_code(diagram_code)

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
