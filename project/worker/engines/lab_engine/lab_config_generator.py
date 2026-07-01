"""
Dynamic Virtual Lab Config Generator
Generates rich lab_config JSON alongside every chat reply.
Used by Node.js service to enrich with real YouTube + Sketchfab data.
"""

import re
from typing import Optional

# ─── SUBJECT DETECTION ────────────────────────────────────────────────────────
SUBJECT_KEYWORDS = {
    "biology": [
        "cell", "mitosis", "meiosis", "photosynthesis", "respiration",
        "digestion", "heart", "blood", "dna", "rna", "protein", "enzyme",
        "reproduction", "menstruation", "nervous", "endocrine", "immune",
        "ecosystem", "food chain", "evolution", "genetics", "chromosome",
        "ovary", "uterus", "fertilization", "embryo", "organ", "tissue",
        "bacteria", "virus", "fungi", "algae", "plant", "animal", "human body"
    ],
    "chemistry": [
        "h2o", "co2", "chemical", "reaction", "acid", "base", "salt",
        "element", "compound", "mixture", "atom", "molecule", "bond",
        "covalent", "ionic", "periodic", "oxidation", "reduction", "redox",
        "haber", "catalyst", "electrolysis", "mole", "valency", "formula",
        "ph", "titration", "distillation", "combustion", "polymer"
    ],
    "physics": [
        "newton", "force", "motion", "velocity", "acceleration", "gravity",
        "energy", "power", "work", "momentum", "friction", "pressure",
        "light", "reflection", "refraction", "lens", "mirror", "optics",
        "electricity", "current", "voltage", "resistance", "ohm", "circuit",
        "magnetism", "electromagnetic", "wave", "sound", "heat", "thermodynamics",
        "projectile", "parabola", "trajectory", "pendulum"
    ],
    "mathematics": [
        "equation", "algebra", "linear", "quadratic", "polynomial",
        "trigonometry", "sin", "cos", "tan", "geometry", "circle", "triangle",
        "integration", "differentiation", "calculus", "limit", "derivative",
        "matrix", "vector", "coordinate", "slope", "intercept", "graph",
        "set theory", "number system", "arithmetic", "progression", "series"
    ],
    "statistics": [
        "mean", "median", "mode", "standard deviation", "variance",
        "probability", "distribution", "normal distribution", "chi square",
        "regression", "correlation", "histogram", "bar chart", "scatter",
        "hypothesis", "sampling", "census", "data", "frequency"
    ],
    "accounting": [
        "debit", "credit", "ledger", "journal", "balance sheet",
        "profit", "loss", "trial balance", "trading account", "cash flow",
        "depreciation", "asset", "liability", "equity", "revenue",
        "t-account", "double entry", "bookkeeping", "gst", "tds"
    ],
    "history": [
        "french revolution", "world war", "independence", "mughal",
        "british", "gandhi", "nehru", "partition", "colonial", "emperor",
        "treaty", "ancient", "medieval", "modern", "civilization"
    ],
    "geography": [
        "earthquake", "volcano", "climate", "monsoon", "river", "mountain",
        "plateau", "latitude", "longitude", "map", "continent", "ocean",
        "rainfall", "erosion", "soil", "forest", "agriculture"
    ],
    "economics": [
        "demand", "supply", "market", "gdp", "inflation", "deflation",
        "monetary", "fiscal", "budget", "tax", "trade", "import", "export",
        "unemployment", "poverty", "development"
    ]
}

# Sensitivity rules per topic
SENSITIVITY_MAP = {
    "reproduction": 1,
    "menstruation": 1,
    "fertilization": 1,
    "ovary": 1,
    "uterus": 1,
    "embryo": 1,
    "contraception": 2,
    "sexually transmitted": 2,
    "std": 2,
}

# 3D model approach per subject
THREE_JS_TYPES = {
    "mathematics": "math_graph",
    "statistics": "stat_chart",
    "physics": "physics_simulation",
    "chemistry": "molecule_viewer",
    "biology": "anatomy_diagram",
    "accounting": "ledger_visual",
    "economics": "economic_graph",
    "geography": "geo_diagram",
    "history": None,
    "general": None
}

# Sketchfab model IDs whitelist (educational only)
SKETCHFAB_MODELS = {
    "cell": "animal_cell_model",
    "mitosis": "animal_cell_model",
    "meiosis": "animal_cell_model",
    "heart": "human_heart_anatomy",
    "brain": "human_brain",
    "dna": "dna_double_helix",
    "h2o": "water_molecule",
    "co2": "co2_molecule",
    "benzene": "benzene_ring",
    "digestive": "human_digestive_system",
    "eye": "human_eye",
    "ear": "human_ear",
    "lungs": "human_lungs",
    "skeleton": "human_skeleton",
    "sex": "dna_double_helix",
    "gender": "dna_double_helix",
    "reproduction": "dna_double_helix",
    "chromosomes": "dna_double_helix",
}

# Sensitive topics that should get 3D models
NO_3D_TOPICS = []


def detect_subject(message: str) -> str:
    """Detect the academic subject from student message."""
    msg_lower = message.lower()
    subject_scores = {}
    
    for subject, keywords in SUBJECT_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in msg_lower)
        if score > 0:
            subject_scores[subject] = score
    
    if not subject_scores:
        return "general"
    
    return max(subject_scores, key=subject_scores.get)


def get_sensitivity_level(message: str) -> int:
    """Return sensitivity level 0=safe, 1=moderate, 2=sensitive."""
    msg_lower = message.lower()
    max_level = 0
    for topic, level in SENSITIVITY_MAP.items():
        if topic in msg_lower:
            max_level = max(max_level, level)
    return max_level


def get_sketchfab_hint(message: str, subject: str, sensitivity: int) -> Optional[str]:
    """Return a Sketchfab model search hint if appropriate."""
    msg_lower = message.lower()
    
    # Check specific model matches
    for keyword, model_id in SKETCHFAB_MODELS.items():
        if keyword in msg_lower:
            return model_id
    
    # Subject-based fallbacks
    subject_models = {
        "chemistry": "molecule_3d",
        "biology": "biology_model",
        "physics": "molecule_3d",
    }
    return subject_models.get(subject, "biology_model")


def get_diagram_type(message: str, subject: str, sensitivity: int) -> Optional[str]:
    """Return diagram type for 2D SVG rendering."""
    msg_lower = message.lower()
    
    diagram_map = {
        "mitosis": "cell_mitosis_stages",
        "meiosis": "cell_meiosis_stages",
        "photosynthesis": "photosynthesis_process",
        "heart": "human_heart_diagram",
        "digestive": "digestive_system",
        "nervous": "nervous_system",
        "reproduction": "reproductive_system_2d",  # Always 2D SVG
        "food chain": "food_chain_diagram",
        "water cycle": "water_cycle",
        "nitrogen cycle": "nitrogen_cycle",
        "circuit": "electric_circuit",
        "refraction": "light_refraction",
        "reflection": "light_reflection",
        "periodic": "periodic_table",
        "balance sheet": "balance_sheet_template",
        "t-account": "t_account_template",
    }
    
    for keyword, diagram in diagram_map.items():
        if keyword in msg_lower:
            return diagram
    
    return f"{subject}_general_diagram"


def get_three_js_config(message: str, subject: str) -> Optional[dict]:
    """Generate Three.js simulation config for math/physics/stats."""
    msg_lower = message.lower()
    
    if subject == "mathematics":
        # Detect equation type
        if "quadratic" in msg_lower or "parabola" in msg_lower:
            return {"type": "quadratic_graph", "params": {"a": 1, "b": 0, "c": 0}, "sliders": ["a", "b", "c"]}
        elif "linear" in msg_lower or "slope" in msg_lower:
            return {"type": "linear_graph", "params": {"m": 1, "c": 0}, "sliders": ["m", "c"]}
        elif "trigonometry" in msg_lower or "sin" in msg_lower or "cos" in msg_lower:
            return {"type": "trig_graph", "params": {"func": "sin", "amplitude": 1, "frequency": 1}, "sliders": ["amplitude", "frequency"]}
        elif "circle" in msg_lower:
            return {"type": "circle_geometry", "params": {"radius": 5}, "sliders": ["radius"]}
        else:
            return {"type": "function_plotter", "params": {"expression": "x^2"}, "sliders": []}
    
    elif subject == "statistics":
        if "normal" in msg_lower or "bell" in msg_lower or "distribution" in msg_lower:
            return {"type": "normal_distribution", "params": {"mean": 0, "std": 1}, "sliders": ["mean", "std"]}
        elif "histogram" in msg_lower:
            return {"type": "histogram", "params": {}, "sliders": []}
        elif "regression" in msg_lower:
            return {"type": "scatter_regression", "params": {}, "sliders": []}
        else:
            return {"type": "bar_chart", "params": {}, "sliders": []}
    
    elif subject == "physics":
        if "projectile" in msg_lower or "trajectory" in msg_lower:
            return {"type": "projectile_motion", "params": {"angle": 45, "speed": 20, "gravity": 9.8}, "sliders": ["angle", "speed"]}
        elif "wave" in msg_lower or "sound" in msg_lower:
            return {"type": "wave_simulation", "params": {"amplitude": 1, "frequency": 1, "wavelength": 1}, "sliders": ["amplitude", "frequency"]}
        elif "pendulum" in msg_lower:
            return {"type": "pendulum_simulation", "params": {"length": 1, "angle": 30}, "sliders": ["length", "angle"]}
        elif "circuit" in msg_lower or "ohm" in msg_lower:
            return {"type": "circuit_simulator", "params": {"voltage": 12, "resistance": 6}, "sliders": ["voltage", "resistance"]}
        else:
            return {"type": "physics_general", "params": {}, "sliders": []}
    
    elif subject == "chemistry":
        return {"type": "molecule_builder", "params": {}, "sliders": []}
    
    elif subject == "accounting":
        return {"type": "ledger_visual", "params": {}, "sliders": []}
    
    return None


def generate_youtube_query(message: str, subject: str, topic: str, grade_level: str) -> str:
    """Generate a targeted YouTube search query for educational video."""
    grade_label = grade_level.replace("_", " ").title() if grade_level else "Class 10"
    
    # Subject-specific channel preferences
    channel_hints = {
        "biology": "NCERT Biology",
        "chemistry": "NCERT Chemistry",
        "physics": "Physics Wallah",
        "mathematics": "NCERT Math",
        "statistics": "Statistics Tutorial",
        "accounting": "Accounts Class",
        "history": "NCERT History",
        "geography": "Geography NCERT",
        "economics": "Economics Class"
    }
    
    channel = channel_hints.get(subject, "NCERT")
    query = f"{channel} {topic} {grade_label} explanation animation"
    return query


def generate_lab_config(
    message: str,
    ai_reply: str,
    topic: str,
    subject_from_intent: Optional[str],
    grade_level: str,
    board: str
) -> Optional[dict]:
    """
    Master function: Generate complete lab_config from student message + AI reply.
    Returns None if topic doesn't benefit from visual lab.
    """
    # Use intent-detected subject or detect from message
    subject = subject_from_intent or detect_subject(message)
    
    # Skip lab for non-visual subjects with low educational lab value
    no_lab_subjects = ["general", "history"]
    if subject in no_lab_subjects:
        return None
    
    # Also skip for simple greetings / short messages
    if len(message.strip()) < 15:
        return None
    
    sensitivity = get_sensitivity_level(message + " " + ai_reply)
    three_js_config = get_three_js_config(message, subject)
    sketchfab_hint = get_sketchfab_hint(message, subject, sensitivity)
    diagram_type = get_diagram_type(message, subject, sensitivity)
    youtube_query = generate_youtube_query(message, subject, topic or subject, grade_level)
    
    # Determine available content layers
    content_layers = ["text", "voice", "diagram"]
    
    if three_js_config:
        content_layers.append("threejs")
    else:
        if not sketchfab_hint:
            sketchfab_hint = "dna_double_helix"
        content_layers.append("sketchfab")
        
    content_layers.append("youtube")
    
    return {
        "subject": subject,
        "topic": topic or subject,
        "grade_level": grade_level or "class_10",
        "board": board or "cbse",
        "sensitivity_level": sensitivity,
        "content_layers": content_layers,
        "diagram_type": diagram_type,
        "three_js_config": three_js_config,
        "sketchfab_hint": sketchfab_hint,
        "youtube_query": youtube_query,
        "voice_script": ai_reply[:500] if ai_reply else "",  # First 500 chars for voice
        "auto_open": True  # Always auto-open side panel
    }
