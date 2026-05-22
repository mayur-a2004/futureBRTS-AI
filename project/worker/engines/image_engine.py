from PIL import Image, ImageDraw
import os

def generate_image(payload):
    os.makedirs("outputs", exist_ok=True)
    img = Image.new("RGB", (800, 600), color="white")
    draw = ImageDraw.Draw(img)
    draw.text((50, 50), payload.prompt or "No Prompt", fill="black")

    path = f"outputs/image_{payload.taskId}.png"
    img.save(path)

    return {
        "status": "SUCCESS",
        "artifacts": {"image": path}
    }
