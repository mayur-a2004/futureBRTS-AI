import ffmpeg
import whisper
import os
import uuid
from typing import Dict, Any

# Load model once at module level to avoid reloading (Heavy Operation)
# Using "base" as requested for speed/quality balance locally
try:
    model = whisper.load_model("base")
except Exception as e:
    print(f"Warning: Whisper model could not be loaded: {e}")
    model = None

def extract_audio(video_path: str, output_dir: str = "/tmp") -> Dict[str, Any]:
    """
    Extracts audio from video and transcribes it using Whisper.
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    audio_filename = f"{uuid.uuid4()}.wav"
    audio_path = os.path.join(output_dir, audio_filename)
    
    # Extract audio using ffmpeg
    try:
        (
            ffmpeg
            .input(video_path)
            .output(audio_path, ac=1, ar=16000) # Mono, 16kHz for Whisper
            .run(quiet=True, overwrite_output=True)
        )
    except ffmpeg.Error as e:
        raise RuntimeError(f"FFmpeg extraction failed: {e}")

    transcript_text = ""
    if model:
        try:
            result = model.transcribe(audio_path)
            transcript_text = result["text"]
        except Exception as e:
            transcript_text = f"[Transcription Failed: {str(e)}]"
            
    return {
        "audio_path": audio_path,
        "transcript": transcript_text
    }
