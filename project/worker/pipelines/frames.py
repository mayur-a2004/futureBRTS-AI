import cv2
import os
import uuid
from typing import List

def extract_frames(video_path: str, interval: int = 3, output_dir: str = "/tmp") -> List[str]:
    """
    Extracts frames from a video file at a specified interval.
    Real Implementation using OpenCV.
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    cap = cv2.VideoCapture(video_path)
    frames = []
    count = 0
    
    if not cap.isOpened():
        raise ValueError(f"Could not open video file: {video_path}")

    try:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            # Capture frame every 'interval' frames (simple sampling)
            # For time-based interval (e.g., every 1 sec), we'd need fps calc.
            # Assuming 30fps, interval=30 means every second.
            if count % (interval * 30) == 0: 
                frame_filename = f"frame_{uuid.uuid4()}.jpg"
                frame_path = os.path.join(output_dir, frame_filename)
                cv2.imwrite(frame_path, frame)
                frames.append(frame_path)

            count += 1
    finally:
        cap.release()
        
    return frames
