
"""
TITAN DEGREE MATRIX - MASTER CONFIGURATION
This file contains the strict Academic Mapping for Indian Education System.
"""

class DegreeMatrix:
    
    # 3. DELIVERABLE TEMPLATES (Fixed as per Master Prompt)
    TEMPLATES = {
        "Computer Science": [
            {"name": "Project Title", "required": True, "type": "Academic", "notes": "Clear, concise title"},
            {"name": "Abstract", "required": True, "type": "Academic", "notes": "Summary of the project"},
            {"name": "Problem Statement", "required": True, "type": "Academic", "notes": "What issue is being solved"},
            {"name": "Scope", "required": True, "type": "Academic", "notes": "Boundaries of the project"},
            {"name": "Technology Stack", "required": True, "type": "Technical", "notes": "Languages, Tools, DBs"},
            {"name": "DFD", "required": True, "type": "Technical", "notes": "Data Flow Diagrams (Level 0-2)"},
            {"name": "ER Diagram", "required": True, "type": "Technical", "notes": "Entity Relationship Model"},
            {"name": "UML Diagrams", "required": True, "type": "Technical", "notes": "Class, Sequence, Use Case"},
            {"name": "Database Schema", "required": True, "type": "Technical", "notes": "Table structures"},
            {"name": "Source Code", "required": True, "type": "Technical", "notes": "Complete working code"},
            {"name": "Testing", "required": True, "type": "Technical", "notes": "Test cases and results"},
            {"name": "Output Screenshots", "required": True, "type": "Presentation", "notes": "Visual proof of working"},
            {"name": "Documentation", "required": True, "type": "Presentation", "notes": "User Manual / Installation"},
            {"name": "PPT", "required": True, "type": "Presentation", "notes": "Presentation Slides"},
            {"name": "Viva Questions", "required": True, "type": "Evaluation", "notes": "Q&A Preparation"}
        ],
        "Management": [
            {"name": "Topic", "required": True, "type": "Academic", "notes": "Research Topic"},
            {"name": "Literature Review", "required": True, "type": "Academic", "notes": "Review of existing papers"},
            {"name": "Research Methodology", "required": True, "type": "Research", "notes": "Methods used for study"},
            {"name": "Questionnaire", "required": True, "type": "Research", "notes": "Survey questions"},
            {"name": "Data Collection", "required": True, "type": "Research", "notes": "Raw data gathered"},
            {"name": "Data Analysis", "required": True, "type": "Research", "notes": "Charts, Graphs, Statistical tests"},
            {"name": "Findings", "required": True, "type": "Research", "notes": "Key outcomes"},
            {"name": "Report", "required": True, "type": "Presentation", "notes": "Final formal report"},
            {"name": "PPT", "required": True, "type": "Presentation", "notes": "Summary slides"},
            {"name": "Viva Q&A", "required": True, "type": "Evaluation", "notes": "Defense preparation"}
        ],
        "Medical": [
            {"name": "Case History", "required": True, "type": "Clinical", "notes": "Patient background"},
            {"name": "Chief Complaint", "required": True, "type": "Clinical", "notes": "Primary issue"},
            {"name": "Clinical Examination", "required": True, "type": "Clinical", "notes": "Physical observations"},
            {"name": "Lab Reports", "required": True, "type": "Clinical", "notes": "Test results"},
            {"name": "Differential Diagnosis", "required": True, "type": "Clinical", "notes": "Possible conditions"},
            {"name": "Final Diagnosis", "required": True, "type": "Clinical", "notes": "Confirmed condition"},
            {"name": "Treatment Plan", "required": True, "type": "Clinical", "notes": "Medication/Surgery"},
            {"name": "Prognosis", "required": True, "type": "Clinical", "notes": "Expected outcome"},
            {"name": "Case File", "required": True, "type": "Presentation", "notes": "Documented case study"},
            {"name": "PPT", "required": True, "type": "Presentation", "notes": "Case presentation"},
            {"name": "Viva", "required": True, "type": "Evaluation", "notes": "Oral examination"}
        ],
        "Law": [
            {"name": "Case Title", "required": True, "type": "Academic", "notes": "Title of the case/study"},
            {"name": "Facts of the Case", "required": True, "type": "Academic", "notes": "Background facts"},
            {"name": "Issues Raised", "required": True, "type": "Legal", "notes": "Legal questions"},
            {"name": "Arguments", "required": True, "type": "Legal", "notes": "Petitioner vs Respondent"},
            {"name": "Judgment Analysis", "required": True, "type": "Legal", "notes": "Court's ruling breakdown"},
            {"name": "Precedents Cited", "required": True, "type": "Legal", "notes": "References to past cases"},
            {"name": "Conclusion", "required": True, "type": "Academic", "notes": "Final thoughts"},
            {"name": "Moot Court Memo", "required": False, "type": "Presentation", "notes": "For simulation"},
            {"name": "Viva", "required": True, "type": "Evaluation", "notes": "Oral defense"}
        ]
    }

    # Default Template for general degrees
    DEFAULT_TEMPLATE = [
        {"name": "Title", "required": True, "type": "Academic", "notes": "Project Title"},
        {"name": "Introduction", "required": True, "type": "Academic", "notes": "Overview"},
        {"name": "Core Analysis", "required": True, "type": "Research", "notes": "Main body of work"},
        {"name": "Conclusion", "required": True, "type": "Academic", "notes": "Final results"},
        {"name": "References", "required": True, "type": "Academic", "notes": "Citations"},
        {"name": "Report", "required": True, "type": "Presentation", "notes": "Final Document"}
    ]

    # 1. DEGREE DATASET (Sample of the Master List)
    # Structured as: ShortName -> (FullName, Level, Regulator, DomainPrimary, DomainSpecialization, TemplateKey)
    DEGREES = {
        # Engineering (CS/IT)
        "B.Tech": ("Bachelor of Technology", "UG", "AICTE", "Engineering & Technology", "Computer Science", "Computer Science"),
        "BE": ("Bachelor of Engineering", "UG", "AICTE", "Engineering & Technology", "Computer Science", "Computer Science"),
        "BCA": ("Bachelor of Computer Applications", "UG", "AICTE", "Engineering & Technology", "Computer Science", "Computer Science"),
        "MCA": ("Master of Computer Applications", "PG", "AICTE", "Engineering & Technology", "Computer Science", "Computer Science"),
        "BSc CS": ("Bachelor of Science in Computer Science", "UG", "UGC", "Engineering & Technology", "Computer Science", "Computer Science"),
        "MSc CS": ("Master of Science in Computer Science", "PG", "UGC", "Engineering & Technology", "Computer Science", "Computer Science"),
        
        # Management
        "MBA": ("Master of Business Administration", "PG", "AICTE", "Management", "Business Administration", "Management"),
        "BBA": ("Bachelor of Business Administration", "UG", "AICTE", "Management", "Business Administration", "Management"),
        "PGDM": ("Post Graduate Diploma in Management", "PG", "AICTE", "Management", "Business Administration", "Management"),
        
        # Medical
        "MBBS": ("Bachelor of Medicine, Bachelor of Surgery", "UG", "NMC", "Medical Sciences", "Medicine", "Medical"),
        "MD": ("Doctor of Medicine", "PG", "NMC", "Medical Sciences", "Medicine", "Medical"),
        "BDS": ("Bachelor of Dental Surgery", "UG", "DCI", "Dental", "Dentistry", "Medical"),
        "B.Pharm": ("Bachelor of Pharmacy", "UG", "PCI", "Pharmacy", "Pharmacy", "Medical"),
        
        # Law
        "LLB": ("Bachelor of Laws", "UG", "BCI", "Law", "Law", "Law"),
        "BA-LLB": ("Bachelor of Arts and Bachelor of Laws", "UG", "BCI", "Law", "Law", "Law"),
        "LLM": ("Master of Laws", "PG", "BCI", "Law", "Law", "Law"),
        
        # Commerce
        "B.Com": ("Bachelor of Commerce", "UG", "UGC", "Commerce", "Finance", "Management"),
        "M.Com": ("Master of Commerce", "PG", "UGC", "Commerce", "Finance", "Management"),
        
        # Arts
        "BA": ("Bachelor of Arts", "UG", "UGC", "Arts & Humanities", "General", "Management"), # Using Management template for generic research
        "MA": ("Master of Arts", "PG", "UGC", "Arts & Humanities", "General", "Management")
    }

    @classmethod
    def get_degree_DNA(cls, degree_input: str) -> dict:
        """
        Matrix Expansion Logic:
        Degree -> Domain -> Template -> JSON Object
        """
        # Normalize/Fuzzy Match (Simple version)
        match = None
        for key in cls.DEGREES:
            if key.lower() == degree_input.lower() or key.replace(".", "").lower() == degree_input.replace(".", "").lower():
                match = cls.DEGREES[key]
                break
        
        # Default if not found (Anti-Gravity Behavior)
        if not match:
             # Infer basics
             return {
                "degree_full": degree_input,
                "degree_short": degree_input,
                "level": "Unknown",
                "regulator": "UGC", # Default
                "domain_primary": "General",
                "deliverables": cls.DEFAULT_TEMPLATE
             }

        fullname, level, regulator, dom_primary, dom_spec, template_key = match
        
        return {
            "degree_full": fullname,
            "degree_short": degree_input,
            "level": level,
            "regulator": regulator,
            "domain_primary": dom_primary,
            "domain_specialization": dom_spec,
            "deliverables": cls.TEMPLATES.get(template_key, cls.DEFAULT_TEMPLATE)
        }

degree_matrix = DegreeMatrix()
