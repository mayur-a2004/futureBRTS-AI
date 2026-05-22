import os
import json
import re
import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image, Table, TableStyle
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from utils.diagram_engine import diagram_engine
from utils.sanitizer import sanitize_for_xml

PROJECTS_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "backend", "projects"))
os.makedirs(PROJECTS_ROOT, exist_ok=True)

def sanitize_for_xml(text):
    """Removes control characters that break XML-based formats (DOCX/PPTX/PDF)."""
    if not text: return ""
    illegal_chars = re.compile(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x84\x86-\x9f\ud800-\udfff\ufdd0-\ufdef\ufffe\uffff]')
    return illegal_chars.sub('', str(text))

def generate_project_pdf(project_name, category, field, project_type, tech_stack, vision, ai_content, job_id, images=None):
    safe_name = re.sub(r'[^\w\s-]', '', project_name).strip().replace(' ', '_')
    filename = f"Project_Report_{safe_name}_{job_id[:8]}.pdf"
    doc_dir = os.path.join(PROJECTS_ROOT, job_id, "docs")
    os.makedirs(doc_dir, exist_ok=True)
    path = os.path.join(doc_dir, filename)

    doc = SimpleDocTemplate(path, pagesize=A4, rightMargin=2*cm, leftMargin=3*cm, topMargin=2.5*cm, bottomMargin=2.5*cm)
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], fontSize=24, leading=30, alignment=TA_CENTER, spaceAfter=20, fontName='Helvetica-Bold')
    h1_style = ParagraphStyle('H1Style', parent=styles['Heading1'], fontSize=18, leading=22, textColor=colors.HexColor("#1F497D"), spaceBefore=15, spaceAfter=10, fontName='Helvetica-Bold')
    body_style = ParagraphStyle('BodyStyle', parent=styles['Normal'], fontSize=11, leading=14, alignment=TA_JUSTIFY, fontName='Times-Roman')

    # Load Master Blueprint (Academic Standard) - Fix 5: Absolute Path
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    blueprint_path = os.path.join(base_dir, "storage", "templates", "master_blueprint.json")
    master_blueprint = {}
    if os.path.exists(blueprint_path):
        with open(blueprint_path, "r") as f:
            master_blueprint = json.load(f)
    else:
        print(f"⚠️ MASTER BLUEPRINT NOT FOUND AT {blueprint_path}")

    # helper for AI extraction (More robust)
    def get_section_text(num, title, fallback):
        pattern = rf"(?:{num}\.?\s+|[Cc]hapter\s*{num}\.?\s+){title}(.*?)(?=(?:\d+\.?\s+|[Cc]hapter\s*\d+\.?\s+|$))"
        match = re.search(pattern, ai_content, re.DOTALL | re.IGNORECASE)
        
        extracted_content = fallback
        mermaid_codes = []

        if match:
             extracted_content = match.group(1).strip().replace("*", "").replace("\n", "<br/>")
        
        # SEARCH FOR MERMAID BLOCKS
        mermaid_pattern = r"\[MERMAID_START\](.*?)\[MERMAID_END\]"
        matches = re.findall(mermaid_pattern, ai_content if not match else match.group(1), re.DOTALL)
        for m in matches:
            mermaid_codes.append(m.strip())

        return extracted_content, mermaid_codes

    elements = []

    # 1. Cover Page (Industrial Layout)
    if images and 'logo' in images:
        try:
            logo = Image(images['logo'], width=6*cm, height=6*cm)
            elements.append(logo)
        except: pass
    
    elements.append(Spacer(1, 2*cm))
    elements.append(Paragraph(f"TITAN INDUSTRIAL DOSSIER<br/>TECHNICAL REPORT ON<br/>{project_name.upper()}", title_style))
    elements.append(Spacer(1, 1*cm))
    elements.append(Paragraph(f"A Technical Submission for the requirements of:<br/>{category}", ParagraphStyle('P', parent=body_style, alignment=TA_CENTER, fontSize=14, fontName='Helvetica-Bold')))
    elements.append(Spacer(1, 1*cm))
    elements.append(Paragraph(f"Field: {field}", ParagraphStyle('P2', parent=body_style, alignment=TA_CENTER)))
    elements.append(Paragraph(f"Technology: {tech_stack}", ParagraphStyle('P3', parent=body_style, alignment=TA_CENTER)))
    elements.append(Spacer(1, 3*cm))
    elements.append(Paragraph(f"<b>GENESIS NEURAL ARCHITECT v5.0</b><br/>Academic Year: {datetime.datetime.now().year}", ParagraphStyle('P4', parent=body_style, alignment=TA_CENTER)))
    elements.append(PageBreak())

    # 2. INDUSTRIAL BOILERPLATE ENGINE
    academic_boilerplate = {
        "Abstract": f"This project, {project_name}, represents a strategic implementation of {tech_stack} to solve critical industrial gaps in the {field} domain. The system leverages a 3-tier architecture, ensuring scalability, security, and real-time data processing.",
        "Introduction": f"The evolution of {field} has necessitated highly responsive and intelligent systems. This report details the architectural genesis of {project_name}, focusing on industrial workflows and technical sustainability.",
        "System Requirements": "HARDWARE: Minimum 8GB RAM, Quad-core Processor, 256GB SSD Architecture.<br/>SOFTWARE: Modern Browser Support, Node.js Runtime, and secure SSL/TLS protocols.",
        "Feasibility Study": "TECHNICAL: The chosen stack is industry-standard.<br/>ECONOMIC: High ROI through automated workflows.<br/>OPERATIONAL: Strategic UI ensures minimal training.",
        "System Design": "The system utilizes a Decoupled 3-Tier Architecture (Presentation, Logic, and Data layers) for maximum industrial throughput.",
        "Database Design": "Designed for 3rd Normal Form (3NF) efficiency, ensuring ACID compliance across all industrial transactions.",
        "Testing": "Includes Unit, Integration, and UAT phases to validate high-fidelity functionality.",
        "Future Scope": "Integration of Neural Networks and transition to distributed Microservices architecture."
    }

    # Sections Mapping
    sections_to_render = master_blueprint.get("structure", [])
    if not sections_to_render:
        sections_to_render = [
            {"text": "Certificate", "fallback": "Verified academic industrial completion certificate dossier."},
            {"text": "Declaration", "fallback": "Formal student declaration of project authenticity."},
            {"text": "Acknowledgement", "fallback": "Strategic recognition of FutureBRTS support core."},
            {"text": "Abstract", "fallback": academic_boilerplate["Abstract"]},
            {"text": "Introduction", "fallback": academic_boilerplate["Introduction"]},
            {"text": "Problem Statement", "fallback": "Current industrial systems lack the required high-fidelity synchronization for {domain}.".format(domain=field)},
            {"text": "Objectives", "fallback": "Deliver a production-grade {stack} solution with neural logic optimization.".format(stack=tech_stack)},
            {"text": "Scope of Project", "fallback": "Operational boundaries covering full-stack orchestration and industrial deployment."},
            {"text": "System Requirements", "fallback": academic_boilerplate["System Requirements"]},
            {"text": "Feasibility Study", "fallback": academic_boilerplate["Feasibility Study"]},
            {"text": "SRS", "fallback": "Comprehensive Software Requirement Specifications following IEEE standards."},
            {"text": "System Design", "fallback": academic_boilerplate["System Design"]},
            {"text": "Database Design", "fallback": academic_boilerplate["Database Design"]},
            {"text": "Data Flow Diagrams", "fallback": "Transactional data flow mapping from ingestion to persistence layers."},
            {"text": "Module Description", "fallback": "Segmentation into Secure Auth, Core Business Logic, and Intelligence Dashboards."},
            {"text": "Implementation", "fallback": "Full implementation using {stack} with optimized CI/CD workflows.".format(stack=tech_stack)},
            {"text": "Source Code Strategy", "fallback": "Clean code architecture with modular logic and high-density documentation."},
            {"text": "Testing", "fallback": academic_boilerplate["Testing"]},
            {"text": "Visual Representation", "fallback": "High-fidelity UI dashboards and UX interaction walkthroughs."},
            {"text": "Results", "fallback": "Successful validation against industrial KPIs and strategic objectives."},
            {"text": "Future Scope", "fallback": academic_boilerplate["Future Scope"]},
            {"text": "References", "fallback": "Industrial standards and IEEE technological documentation."}
        ]

    for i, section in enumerate(sections_to_render, 1):
        title = section.get("text", f"Section {i}")
        fallback_msg = section.get("fallback", "Detailed technical analysis provided in source archives.")
        
        elements.append(Paragraph(f"{i}. {sanitize_for_xml(title)}", h1_style))
        content_text, mermaid_diagrams = get_section_text(i, title, fallback_msg)
        elements.append(Paragraph(sanitize_for_xml(content_text if len(content_text) > 10 else fallback_msg), body_style))
        
        # RENDER AND EMBED DIAGRAMS
        diagram_dir = os.path.join("storage", "projects", job_id, "diagrams")
        os.makedirs(diagram_dir, exist_ok=True)
        
        # Embed existing pre-generated diagrams if any (Fix Engine Step 5/8/9)
        if i == 12 or i == 13 or i == 20: # Design/DB/Outcome sections
             for f in os.listdir(diagram_dir):
                if f.endswith(".png"):
                    try:
                        f_path = os.path.join(diagram_dir, f)
                        elements.append(Spacer(1, 0.5*cm))
                        ui_img = Image(f_path, width=15*cm, height=8.4*cm)
                        elements.append(ui_img)
                        elements.append(Paragraph(f"Industrial Diagram: {f.replace('_',' ').replace('.png','')}", ParagraphStyle('Fig', parent=body_style, alignment=TA_CENTER, fontSize=8)))
                    except: pass

        for idx, m_code in enumerate(mermaid_diagrams):
             try:
                  img_path = diagram_engine.render_mermaid(m_code, output_dir=diagram_dir)
                  if img_path:
                       elements.append(Spacer(1, 0.5*cm))
                       ui_img = Image(img_path, width=15*cm, height=8.4*cm)
                       elements.append(ui_img)
                       elements.append(Paragraph(f"Figure {i}.{idx+1}: Industrial {title} Schematic", ParagraphStyle('Fig', parent=body_style, alignment=TA_CENTER, fontSize=8)))
             except: pass
        
        # Add UI Mockup in 19 or Visual Sections
        if ("Visual" in title or "Design" in title or i == 19) and images and 'mockup' in images:
            try:
                elements.append(Spacer(1, 1*cm))
                ui_img = Image(images['mockup'], width=15*cm, height=8.4*cm)
                elements.append(ui_img)
            except: pass

        elements.append(PageBreak())

    try:
        doc.build(elements)
    except Exception as e:
        print(f"Error building PDF: {str(e)}")
        doc.build([Paragraph(f"Error generating full report: {str(e)}", styles['Normal'])])
        
    return path
