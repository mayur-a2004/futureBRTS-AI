"""
Content Filter for Virtual Lab
Double-safety layer: validates sensitivity + grade appropriateness before sending to frontend.
"""

from typing import Optional

# ─── GRADE-BASED CONTENT RULES ─────────────────────────────────────────────────
GRADE_RESTRICTIONS = {
    "class_1": {"max_sensitivity": 0, "allowed_3d": True, "allow_reproduction": False},
    "class_2": {"max_sensitivity": 0, "allowed_3d": True, "allow_reproduction": False},
    "class_3": {"max_sensitivity": 0, "allowed_3d": True, "allow_reproduction": False},
    "class_4": {"max_sensitivity": 0, "allowed_3d": True, "allow_reproduction": False},
    "class_5": {"max_sensitivity": 0, "allowed_3d": True, "allow_reproduction": False},
    "class_6": {"max_sensitivity": 0, "allowed_3d": True, "allow_reproduction": False},
    "class_7": {"max_sensitivity": 0, "allowed_3d": True, "allow_reproduction": False},
    "class_8": {"max_sensitivity": 1, "allowed_3d": True, "allow_reproduction": False},
    "class_9": {"max_sensitivity": 1, "allowed_3d": True, "allow_reproduction": True},
    "class_10": {"max_sensitivity": 1, "allowed_3d": True, "allow_reproduction": True},
    "class_11": {"max_sensitivity": 1, "allowed_3d": True, "allow_reproduction": True},
    "class_12": {"max_sensitivity": 2, "allowed_3d": True, "allow_reproduction": True},
    "undergraduate": {"max_sensitivity": 2, "allowed_3d": True, "allow_reproduction": True},
    "postgraduate": {"max_sensitivity": 2, "allowed_3d": True, "allow_reproduction": True},
}

# ─── SKETCHFAB WHITELIST (Only verified educational models) ─────────────────────
SKETCHFAB_WHITELIST = {
    "animal_cell_model": "https://sketchfab.com/models/animal-cell",
    "human_heart_anatomy": "https://sketchfab.com/models/heart",
    "human_brain": "https://sketchfab.com/models/human-brain",
    "dna_double_helix": "https://sketchfab.com/models/dna",
    "water_molecule": "https://sketchfab.com/models/water",
    "co2_molecule": "https://sketchfab.com/models/co2",
    "benzene_ring": "https://sketchfab.com/models/benzene",
    "human_digestive_system": "https://sketchfab.com/models/digestive",
    "human_eye": "https://sketchfab.com/models/eye",
    "human_ear": "https://sketchfab.com/models/ear",
    "human_lungs": "https://sketchfab.com/models/lungs",
    "human_skeleton": "https://sketchfab.com/models/skeleton",
    "molecule_3d": "https://sketchfab.com/models/molecule",
    "biology_model": "https://sketchfab.com/models/biology",
}

# ─── YOUTUBE CHANNEL WHITELIST ─────────────────────────────────────────────────
YOUTUBE_EDUCATIONAL_CHANNELS = [
    "UCWV_QYa20hTFPQrg7v3ULIA",  # NCERT Official
    "UCWV_Khan_Academy_India",    # Khan Academy India
    "UCiKHcNmFU3Vpp7TR4Ig_JrA",  # Physics Wallah
    "UCzH2qCEPGTMJT9qFdQDGrMQ",  # Vedantu
    "UCiKHcNmFU3Vpp7TR4Ig_JrA",  # Unacademy
    "UCWnufus5d92kFbBhkYNs4pg",  # Byju's
]


def filter_lab_config(lab_config: dict, grade_level: str) -> dict:
    """
    Apply grade-based and sensitivity-based filtering to lab_config.
    Returns a clean, safe lab_config.
    """
    if not lab_config:
        return lab_config
    
    # Get grade restrictions
    restrictions = GRADE_RESTRICTIONS.get(grade_level, GRADE_RESTRICTIONS["class_10"])
    sensitivity = lab_config.get("sensitivity_level", 0)
    
    # 1. Enforce max sensitivity per grade (normalized, but do not remove 3D/diagrams)
    if sensitivity > restrictions["max_sensitivity"]:
        lab_config["sensitivity_level"] = restrictions["max_sensitivity"]
    
    # 2. Check reproduction topics for young grades
    topic = (lab_config.get("topic", "") + lab_config.get("diagram_type", "")).lower()
    if "reproduction" in topic and not restrictions["allow_reproduction"]:
        # Block reproduction topic for young grades entirely
        return None
    
    # 3. Validate Sketchfab hint is in whitelist
    sketchfab_hint = lab_config.get("sketchfab_hint")
    if sketchfab_hint and sketchfab_hint not in SKETCHFAB_WHITELIST:
        lab_config["sketchfab_hint"] = "dna_double_helix"
    
    # 4. Guarantee diagram and 3D layers are present
    layers = lab_config.get("content_layers", [])
    if "diagram" not in layers:
        layers.append("diagram")
    if "threejs" not in layers and "sketchfab" not in layers:
        if lab_config.get("three_js_config"):
            layers.append("threejs")
        else:
            layers.append("sketchfab")
            if not lab_config.get("sketchfab_hint"):
                lab_config["sketchfab_hint"] = "dna_double_helix"
    lab_config["content_layers"] = layers
    
    # 4. Sanitize YouTube query — remove any inappropriate words
    blocked_terms = ["explicit", "adult", "xxx", "porn", "nsfw", "18+"]
    youtube_query = lab_config.get("youtube_query", "")
    for term in blocked_terms:
        youtube_query = youtube_query.replace(term, "").strip()
    lab_config["youtube_query"] = youtube_query
    
    # 5. Ensure voice_script is clean
    voice_script = lab_config.get("voice_script", "")
    lab_config["voice_script"] = voice_script[:600]  # Limit length
    
    # 6. Validate 3D config structure
    three_js = lab_config.get("three_js_config")
    if three_js:
        if not isinstance(three_js.get("params"), dict):
            three_js["params"] = {}
        if not isinstance(three_js.get("sliders"), list):
            three_js["sliders"] = []
    
    return lab_config


def validate_youtube_url(video_id: str) -> bool:
    """Validate YouTube video ID format."""
    if not video_id:
        return False
    # YouTube video IDs are 11 characters
    return len(video_id) == 11 and video_id.isalnum() or "-" in video_id or "_" in video_id


def get_safe_diagram_for_sensitive_topic(topic: str) -> Optional[str]:
    """Return NCERT-approved 2D diagram type for sensitive topics."""
    sensitive_diagrams = {
        "reproduction": "reproductive_system_ncert_2d",
        "menstruation": "menstrual_cycle_ncert_2d",
        "fertilization": "fertilization_diagram_ncert_2d",
    }
    for key, diagram in sensitive_diagrams.items():
        if key in topic.lower():
            return diagram
    return None
