import logging
from ml.degree_matrix import degree_matrix

logger = logging.getLogger(__name__)

class AcademicBrain:
    """
    Titan Academic Brain: Indian Education Structure Specialist.
    Handles UG, PG, and PhD levels with specific regulator and specialization mapping.
    """
    
    LEVEL_MAP = {
        "UG": "Graduation",
        "PG": "Post Graduation",
        "PhD": "Doctoral Programs"
    }

    # Phase 3: Regulator-A Mapping (Accurate India)
    REGULATOR_MAPPING = {
        # Engineering & Tech (AICTE)
        "B.Tech": "AICTE", "BE": "AICTE", "BCA": "AICTE", "B.Sc IT": "UGC", "BSc CS": "UGC",
        "M.Tech": "AICTE", "ME": "AICTE", "MCA": "AICTE", "MSc IT": "UGC",
        "PhD Engineering": "UGC", "PhD Computer Science": "UGC",

        # Management (AICTE)
        "MBA": "AICTE", "PGDM": "AICTE", "Executive MBA": "AICTE", 
        "BBA": "AICTE", "BMS": "AICTE", "BBM": "AICTE", "PhD Management": "UGC",

        # Medical (NMC/DCI/PCI/INC)
        "MBBS": "NMC", "MD": "NMC", "MS": "NMC", "DM": "NMC", "MCh": "NMC",
        "BDS": "DCI", "MDS": "DCI",
        "B.Pharm": "PCI", "M.Pharm": "PCI", "D.Pharm": "PCI",
        "BSc Nursing": "INC", "GNM": "INC", "ANM": "INC",

        # Rehabilitation & Allied (RCI/State)
        "BPT": "RCI", "MPT": "RCI", "BOT": "RCI", "BMLT": "State Medical Board", "BSc Optometry": "State Medical Board",

        # Law (BCI)
        "LLB": "BCI", "BA-LLB": "BCI", "BBA-LLB": "BCI", "BCom-LLB": "BCI", "LLM": "BCI",

        # Architecture (CoA)
        "B.Arch": "CoA", "M.Arch": "CoA", "B.Plan": "CoA",

        # Agriculture & Veterinary (ICAR/VCI)
        "B.Sc Agriculture": "ICAR", "MSc Agriculture": "ICAR", "BFSc": "ICAR", "MFSc": "ICAR", "BSc Dairy": "ICAR",
        "BVSc": "VCI", "MVSc": "VCI",

        # Vocational (NCVT/UGC)
        "BVoc": "UGC", "MVoc": "UGC", "Polytechnic Diploma": "AICTE", "ITI": "NCVT/NSDC",

        # General Arts/Science/Commerce (UGC)
        "BSc": "UGC", "MSc": "UGC", "B.Com": "UGC", "M.Com": "UGC", "BA": "UGC", "MA": "UGC",
        "PhD Science": "UGC", "PhD Arts": "UGC", "PhD Commerce": "UGC", "PhD Economics": "UGC",
        "DSc": "UGC", "DLitt": "UGC"
    }

    # Phase 2: Degree to Domain Mapping
    FIELD_DOMAIN_MAP = {
        # Engineering
        "B.Tech": ("Engineering & Technology", "Engineering"),
        "BE": ("Engineering & Technology", "Engineering"),
        "BCA": ("Engineering & Technology", "Computer Science"),
        "B.Sc IT": ("Engineering & Technology", "Information Technology"),
        "BSc CS": ("Engineering & Technology", "Computer Science"),
        "M.Tech": ("Engineering & Technology", "Engineering"),
        "ME": ("Engineering & Technology", "Engineering"),
        "MCA": ("Engineering & Technology", "Computer Science"),
        "MSc IT": ("Engineering & Technology", "Information Technology"),
        
        # Medical
        "MBBS": ("Medical", "Medicine"), "MD": ("Medical", "Medicine"), "MS": ("Medical", "Surgery"),
        "BDS": ("Medical", "Dentistry"), "MDS": ("Medical", "Dentistry"),
        "B.Pharm": ("Medical", "Pharmacy"), "M.Pharm": ("Medical", "Pharmacy"), "D.Pharm": ("Medical", "Pharmacy"),
        "BSc Nursing": ("Medical", "Nursing"),
        "BPT": ("Medical", "Physiotherapy"), "MPT": ("Medical", "Physiotherapy"),

        # Law
        "LLB": ("Law", "Law"), "BA-LLB": ("Law", "Law"), "BBA-LLB": ("Law", "Law"), "LLM": ("Law", "Law"),

        # Management
        "BBA": ("Management", "Management"), "MBA": ("Management", "Management"), "PGDM": ("Management", "Management"),
        
        # Commerce
        "B.Com": ("Commerce", "Commerce"), "M.Com": ("Commerce", "Commerce"),

        # Science
        "BSc": ("Science", "Science"), "MSc": ("Science", "Science"),

        # Arts
        "BA": ("Arts", "Humanities"), "MA": ("Arts", "Humanities")
    }

    # Phase 2: Short to Full Name Mapping
    DEGREE_FULL_MAP = {
        "B.Tech": "Bachelor of Technology",
        "BE": "Bachelor of Engineering",
        "BCA": "Bachelor of Computer Applications",
        "B.Sc IT": "Bachelor of Science in Information Technology",
        "BSc CS": "Bachelor of Science in Computer Science",
        "MBBS": "Bachelor of Medicine, Bachelor of Surgery",
        "BDS": "Bachelor of Dental Surgery",
        "B.Pharm": "Bachelor of Pharmacy",
        "BBA": "Bachelor of Business Administration",
        "MBA": "Master of Business Administration",
        "MCA": "Master of Computer Applications",
        "M.Tech": "Master of Technology",
        "MD": "Doctor of Medicine",
        "MS": "Master of Surgery",
        "PhD": "Doctor of Philosophy",
        "LLB": "Bachelor of Laws",
        "LLM": "Master of Laws"
    }

    # Phase 4: S1 Specialization Ruleset
    SPECIALIZATIONS = {
        "Computer Science": ["Full-Stack", "AI & ML", "Cyber Security", "Cloud", "Data Analytics"],
        "Information Technology": ["Network Security", "IT Management", "Software Engineering"],
        "Engineering": ["Civil", "Mechanical", "Electrical", "Electronics", "Computer Science"],
        "Management": ["Finance", "Marketing", "HR", "Operations", "Business Analytics"],
        "Medicine": ["Clinical", "Surgery", "Pathology", "Pharmacology", "Pediatrics"],
        "Dentistry": ["Orthodontics", "Oral Surgery", "Periodontics"],
        "Pharmacy": ["Pharmaceutics", "Pharmacology", "Clinical Pharmacy"],
        "Nursing": ["Critical Care", "Pediatric Nursing", "Community Health"],
        "Physiotherapy": ["Orthopedic", "Neurological", "Sports"],
        "Law": ["Civil", "Criminal", "Corporate", "Constitutional", "Intellectual Property"],
        "Commerce": ["Accounting", "Taxation", "Banking", "Finance"],
        "Science": ["Physics", "Chemistry", "Biology", "Mathematics", "Environmental Science"],
        "Humanities": ["English", "Psychology", "Sociology", "History", "Political Science"],
        "Architecture": ["Urban Design", "Landscape", "Interior Design"],
        "Agriculture": ["Agronomy", "Horticulture", "Dairy Science", "Soil Science"]
    }

    # Phase 5: Output Types Ruleset
    OUTPUT_TYPES = {
        "Engineering & Technology": ["Full-Stack App", "Backend App", "Mobile App", "ML Model", "Research Project"],
        "Management": ["Case Study", "Survey Research", "Internship Report", "Business Plan"],
        "Commerce": ["Accounting Case Study", "Audit Report", "Research Paper"],
        "Science": ["Lab Report", "Journal", "Research Thesis"],
        "Arts": ["Research Project", "Journal Report", "Thesis"],
        "Medical": ["Clinical Case Study", "Research Thesis", "Presentation"],
        "Law": ["Case Analysis", "Moot Court Document", "Legal Research"],
        "Architecture": ["Architectural Design", "Urban Plan", "Model"],
        "Agriculture": ["Field Study", "Crop Analysis", "Research Journal"]
    }

    # ... (Keeping existing mappings for fallback)



    def architect_project(self, meta: dict) -> dict:
        """
        Main logic to normalize and auto-fill project details.
        Legacy 'Phase 3' logic replaced by 'Phase 4 Master Matrix'.
        """
        degree_input = meta.get("degree", "BCA")
        vision = meta.get("vision", "Academic Project")
        
        # 1. GET DNA FROM MASTER MATRIX
        dna = degree_matrix.get_degree_DNA(degree_input)
        
        # 2. Extract Details
        degree_full = dna['degree_full']
        degree_short = dna['degree_short'] or degree_input
        level = dna['level']
        regulator = meta.get("regulator_override") or dna['regulator']
        domain_primary = dna['domain_primary']
        domain_spec = dna['domain_specialization']
        deliverables = dna['deliverables']

        # 3. Fallback / Enhancers (Legacy support for 'tier' etc)
        tier = self.LEVEL_MAP.get(level, "Graduation")
        field = domain_primary # Mapping new key to old key for compatibility
        
        # 4. Specializations (S1) - Keep existing logic or expand
        specs = self.SPECIALIZATIONS.get(domain_spec, ["General"])

        # 5. Output Type Determination
        output_type = meta.get("output_type", "Comprehensive Project")

        return {
            "tier": tier,
            "level": level,
            "degree": degree_short,
            "degree_short": degree_short,
            "degree_full": degree_full,
            "field": field,
            "domain": domain_spec, # Legacy 'domain' usually meant the specialization
            "regulator": regulator,
            "specializations": specs,
            "output_type": output_type,
            "vision": vision,
            "deliverables": deliverables, # NEW: Formal Deliverables List
            "documentation": [d['name'] for d in deliverables if d['type'] in ['Presentation', 'Research', 'Academic']],
            "blueprint": meta.get("blueprint"), # PASSTHROUGH for High-Fidelity AI Content
            "status": "READY"
        }

# Singleton Academic Brain
academic_brain = AcademicBrain()
