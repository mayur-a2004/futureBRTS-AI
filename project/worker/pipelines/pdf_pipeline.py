import pdfplumber
from utils.logger import get_logger
import os
from ml.deep_layer import DeepAnalyzer
from rich.console import Console

console = Console()
logger = get_logger(__name__)

def run(file_path: str, command_info: dict) -> dict:
    logger.info(f"Running Advanced PDF Pipeline for {file_path}")
    
    extracted_text = ""
    is_scanned = False
    metadata = {}
    
    # 1. Extraction Layer
    try:
        with pdfplumber.open(file_path) as pdf:
            metadata["total_pages"] = len(pdf.pages)
            metadata["pdf_producer"] = pdf.metadata.get("Producer", "Unknown")
            
            pages_text = []
            for i, page in enumerate(pdf.pages):
                text = page.extract_text()
                if text:
                    pages_text.append(text)
                
            extracted_text = "\n".join(pages_text)
            
        if len(extracted_text.strip()) < 50:
            is_scanned = True
            extracted_text = "[Analysis: Document appears scanned or image-based. Text layer empty.]"
            # In a full 'Last Layer' implementation, we would auto-trigger OCR here 
            # but user request emphasizes "Boosting" the logic we have.
            
    except Exception as e:
        logger.error(f"PDF extraction failed: {e}")
        extracted_text = f"Error processing PDF: {e}"

    # 2. Deep Analysis Layer (The Boost)
    deep_metrics = DeepAnalyzer.analyze_text_depth(extracted_text)
    
    # 3. Structure Reporting
    result_package = {
        "pipeline": "pdf_deep_v2",
        "is_scanned": is_scanned,
        "metadata": metadata,
        "deep_analysis": deep_metrics
    }
    
    # Prepend analysis summary to text so AI MUST see it
    final_text_output = f"""
[SYSTEM ANALYSIS]
Document Type: PDF ({metadata.get('total_pages', '?')} pages)
Complexity: {deep_metrics.get('complexity_rating', 'Unknown')}
Key Topics: {', '.join(deep_metrics.get('key_topics', []))}
Information Density: {deep_metrics.get('information_density_score', 0) * 100}%
----------------------------------------
{extracted_text}
"""

    return {
        "extracted_text": final_text_output.strip(),
        "result": result_package
    }

def create(content: str, params: dict = {}) -> dict:
    console.print(f"[bold red]📄 PDF GENERATION TRIGGERED[/bold red]")
    
    output_dir = "storage/projects/generated_docs"
    os.makedirs(output_dir, exist_ok=True)
    filename = f"doc_{os.urandom(4).hex()}.pdf"
    output_path = os.path.join(output_dir, filename)
    download_url = f"/downloads/generated_docs/{filename}"

    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        from reportlab.lib.utils import simpleSplit
        
        c = canvas.Canvas(output_path, pagesize=letter)
        width, height = letter
        
        text_object = c.beginText(40, height - 40)
        text_object.setFont("Helvetica", 12)
        
        # Simple text wrapping
        max_width = width - 80
        lines = []
        for line in content.split('\n'):
            wrapped_lines = simpleSplit(line, "Helvetica", 12, max_width)
            lines.extend(wrapped_lines)
            
        # Draw text handling pagination roughly
        y = height - 40
        for line in lines:
            if y < 40:
                c.showPage()
                y = height - 40
                c.setFont("Helvetica", 12)
            c.drawString(40, y, line)
            y -= 14
            
        c.save()

        return {
            "status": "completed",
            "extracted_text": f"PDF generated with content length: {len(content)}",
            "result": {
                "file_path": output_path,
                "download_url": download_url,
                "content_preview": content[:100] + "..."
            }
        }
    except ImportError:
        return {"status": "failed", "error": "ReportLab library missing."}
    except Exception as e:
        return {"status": "failed", "error": str(e)}
