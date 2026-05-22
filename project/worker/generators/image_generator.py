from PIL import Image, ImageDraw, ImageFont
import os
import uuid
from typing import Dict, Any
import textwrap

from config.settings import PROCESSED_DIR

def generate_image_asset(prompt: str, output_dir: str = str(PROCESSED_DIR)) -> str:
    """
    Generates a simple image asset based on the prompt using PIL.
    This provides 'Instant' generation for the boost demo.
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # settings
    width, height = 1024, 768
    bg_color = (15, 23, 42) # Dark Slate (Future BRTS Theme)
    text_color = (0, 255, 127) # Spring Green
    
    img = Image.new('RGB', (width, height), color=bg_color)
    d = ImageDraw.Draw(img)
    
    # Try to verify font or use default
    try:
        font = ImageFont.truetype("arial.ttf", 40)
    except:
        font = ImageFont.load_default()

    # Wrap text
    lines = textwrap.wrap(prompt, width=40)
    y_text = height / 2 - (len(lines) * 25)
    
    d.text((width/2, y_text - 60), "Future BRTS GENERATION", fill=(255, 255, 255), anchor="mm") # Title center
    
    for line in lines:
        bbox = d.textbbox((0, 0), line, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
        d.text(((width - text_w) / 2, y_text), line, font=font, fill=text_color)
        y_text += text_h + 10

    filename = f"gen_{uuid.uuid4()}.png"
    path = os.path.join(output_dir, filename)
    img.save(path)
    return path

def run(prompt: str, context: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generation Pipeline for Images.
    """
    try:
        image_path = generate_image_asset(prompt)
        return {
            "status": "success",
            "generated_file": image_path,
            "type": "image",
            "message": "Image generated successfully."
        }
    except Exception as e:
        return {
            "status": "failed",
            "error": str(e)
        }
