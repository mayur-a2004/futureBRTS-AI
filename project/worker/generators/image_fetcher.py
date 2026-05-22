import os
import requests
import re
from urllib.parse import quote

OUTPUT_DIR = os.path.join("storage", "projects", "assets")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def fetch_project_images(project_name, vision, job_id):
    """
    FIX 2: Remove pollinations.ai completely.
    Uses ultra-stable industrial visual placeholders.
    """
    # Using reliable architecture/tech placeholders that never fail
    mockup_url = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1280&h=720&auto=format&fit=crop"
    logo_url = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=512&h=512&auto=format&fit=crop"
    
    return {
        "logo_url": logo_url,
        "mockup_url": mockup_url
    }
