from dataclasses import dataclass
from typing import Dict, Any

@dataclass
class TrainingConfig:
    # Trigger Thresholds
    SFT_TRIGGER_SIZE: int = 1000  # Number of samples needed to trigger SFT
    DPO_TRIGGER_SIZE: int = 500   # Number of pairs needed to trigger DPO
    
    # Hyperparameters
    LR_SFT: float = 1e-5
    LR_DPO: float = 5e-6
    BATCH_SIZE: str = "auto"
    EPOCHS: int = 3
    MAX_SEQ_LEN: int = 4096
    
    # Infrastructure
    FORCE_CPU: bool = False
    USE_QLORA: bool = True
    
    # Domains for Query Generation
    DOMAINS = [
        "chat", "education_8th_12th", "education_ug_pg", "education_phd", 
        "skill_mapping", "career_planning", "job_transitions", "resume_portfolio",
        "software_dev_ml", "freelancing_business", "research_roadmap", 
        "verification_tasks", "productivity_planning"
    ]
    
    USER_PROFILES = [
        "8th_grader", "high_school_student", "undergrad", "grad_student", 
        "phd_candidate", "junior_employee", "senior_freelancer", "business_owner"
    ]
    
    DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced", "expert"]

config = TrainingConfig()
