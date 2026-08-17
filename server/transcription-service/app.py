"""
BrainWave automatic lecture transcription service.

A small, local, free transcription service for the BrainWave LMS.

Pipeline:

    Cloudinary video URL
        -> download to temp file
        -> audio extraction (FFmpeg)
        -> faster-whisper (speech -> text)
        -> transcript JSON

NOT a paid transcription API. Runs fully local on the developer machine.

Run (from this directory, inside the venv):

    uvicorn app:app --host 127.0.0.1 --port 8001

or simply:

    python app.py

Security notes:
- Only URLs whose hostname ends with cloudinary.com are accepted (SSRF guard).
- The service listens on 127.0.0.1 by default and is intended to be reachable
  only from the local Node.js backend.

Environment variables:
    PORT                            (default 8001)
    WHISPER_MODEL                   (default "base")  tiny|base|small|medium|large-v3
    WHISPER_DEVICE                  (default "cpu")  cpu|cuda
    WHISPER_COMPUTE_TYPE            (default "int8") int8|float16|float32
    WHISPER_BEAM_SIZE               (default 5)
    WHISPER_MAX_DOWNLOAD_BYTES      (default 2147483648 = 2 GB)
    WHISPER_MAX_VIDEO_DURATION_SECONDS (default 7200 = 2 hours)
"""

import logging
import os
import shutil
import subprocess
import tempfile
import time
from pathlib import Path
from urllib.parse import urlparse

import httpx
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

logger = logging.getLogger("brainwave-whisper")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)

PORT = int(os.environ.get("PORT", "8001"))
WHISPER_MODEL = os.environ.get("WHISPER_MODEL", "base")
WHISPER_DEVICE = os.environ.get("WHISPER_DEVICE", "cpu")
WHISPER_COMPUTE_TYPE = os.environ.get("WHISPER_COMPUTE_TYPE", "int8")
WHISPER_BEAM_SIZE = int(os.environ.get("WHISPER_BEAM_SIZE", "5"))
MAX_DOWNLOAD_BYTES = int(
    os.environ.get("WHISPER_MAX_DOWNLOAD_BYTES", str(2 * 1024 * 1024 * 1024))
)
MAX_VIDEO_DURATION_SECONDS = int(
    os.environ.get("WHISPER_MAX_VIDEO_DURATION_SECONDS", "7200")
)

# SSRF guard: the service must only ever download from Cloudinary.
ALLOWED_HOST_SUFFIXES = ("cloudinary.com",)
ALLOWED_SCHEMES = ("http", "https")

app = FastAPI(title="BrainWave Transcription Service", version="1.0.0")
_model = None
_model_name = None

# Path to the FFmpeg binary (None if not installed).
FFMPEG = shutil.which("ffmpeg")


def get_model():
    """Load the faster-whisper model once and reuse it across requests."""
    global _model, _model_name
    if _model is None or _model_name != WHISPER_MODEL:
        import faster_whisper

        logger.info("Loading faster-whisper model '%s' ...", WHISPER_MODEL)
        start = time.time()
        _model = faster_whisper.WhisperModel(
            WHISPER_MODEL,
            device=WHISPER_DEVICE,
            compute_type=WHISPER_COMPUTE_TYPE,
        )
        _model_name = WHISPER_MODEL
        logger.info("Model '%s' loaded in %.2fs", WHISPER_MODEL, time.time() - start)
    return _model


def is_allowed_url(url: str) -> bool:
    """Cloudinary-only URL guard to avoid SSRF / arbitrary downloads."""
    try:
        parsed = urlparse(url)
    except ValueError:
        return False
    if parsed.scheme not in ALLOWED_SCHEMES:
        return False
    host = (parsed.hostname or "").lower()
    return any(host.endswith(suffix) for suffix in ALLOWED_HOST_SUFFIXES)


def download_file(url: str, dest_dir: str) -> Path:
    """Stream-download the video to a temp file with a hard size cap."""
    logger.info("Downloading %s", url[:120])
    start = time.time()
    with httpx.Client(
        timeout=httpx.Timeout(connect=30.0, read=300.0, write=60.0, pool=30.0)
    ) as client:
        with client.stream("GET", url, follow_redirects=True) as response:
            if response.status_code != 200:
                raise RuntimeError(
                    f"Failed to download video (HTTP {response.status_code})"
                )
            content_length = response.headers.get("Content-Length")
            if content_length and int(content_length) > MAX_DOWNLOAD_BYTES:
                raise HTTPException(
                    status_code=413,
                    detail="Video is larger than the configured download limit.",
                )
            dest = Path(dest_dir) / "source_video"
            written = 0
            with open(dest, "wb") as fh:
                for chunk in response.iter_bytes(chunk_size=1024 * 1024):
                    written += len(chunk)
                    if written > MAX_DOWNLOAD_BYTES:
                        raise RuntimeError("Video download exceeded size limit")
                    fh.write(chunk)
    logger.info("Downloaded in %.2f s (%d bytes)", time.time() - start, written)
    return dest


def probe_duration(path: Path) -> float:
    """Return video duration in seconds using PyAV (no external tool needed)."""
    try:
        import av

        with av.open(str(path)) as container:
            duration_micros = container.duration or 0
            return round(duration_micros / 1_000_000, 2)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Could not probe duration of %s: %s", path, exc)
        return 0.0


def extract_audio(video_path: Path, wav_path: Path) -> None:
    """Extract mono 16 kHz PCM WAV using the FFmpeg binary."""
    if not FFMPEG:
        raise RuntimeError(
            "FFmpeg is required for audio extraction but was not found on PATH. "
            "Install FFmpeg (https://ffmpeg.org) and make sure it is on PATH."
        )
    result = subprocess.run(
        [
            FFMPEG,
            "-y",
            "-i",
            str(video_path),
            "-vn",
            "-ac",
            "1",
            "-ar",
            "16000",
            "-c:a",
            "pcm_s16le",
            str(wav_path),
        ],
        capture_output=True,
        timeout=600,
    )
    if result.returncode != 0:
        detail = result.stderr.decode(errors="ignore")[:300]
        raise RuntimeError(f"FFmpeg audio extraction failed: {detail}")

class TranscribeRequest(BaseModel):
    videoUrl: str


def transcribe_video(video_path: Path) -> tuple:
    """Extract audio then run faster-whisper. Returns (transcript, language, sec)."""
    wav_path = video_path.parent / "audio.wav"
    extract_audio(video_path, wav_path)

    model = get_model()
    start = time.time()
    segments, info = model.transcribe(
        str(wav_path), beam_size=WHISPER_BEAM_SIZE, vad_filter=False
    )
    parts = []
    for segment in segments:
        text = (segment.text or "").strip()
        if text:
            parts.append(text)
    transcript = "\n".join(parts).strip()
    language = getattr(info, "language", None) or "en"
    audio_duration = float(getattr(info, "duration", None) or 0)
    logger.info(
        "Transcribe done in %.1f s (lang=%s, audio=%.1f s, chars=%d)",
        time.time() - start,
        language,
        audio_duration,
        len(transcript),
    )
    return transcript, language, audio_duration


@app.get("/health")
def health():
    return {"success": True, "service": "brainwave-whisper", "model": WHISPER_MODEL}


@app.post("/transcribe")
def transcribe(request: TranscribeRequest):
    start = time.time()
    video_url = (request.videoUrl or "").strip()

    if not video_url:
        raise HTTPException(status_code=400, detail="videoUrl is required")
    if not is_allowed_url(video_url):
        raise HTTPException(
            status_code=400, detail="Only Cloudinary video URLs are allowed"
        )

    tmp_dir = tempfile.mkdtemp(prefix="brainwave_whisper_")
    try:
        video_path = download_file(video_url, tmp_dir)
        duration = probe_duration(video_path)
        if duration and duration > MAX_VIDEO_DURATION_SECONDS:
            raise HTTPException(
                status_code=422,
                detail=f"Video is too long ({duration:.0f} seconds)",
            )

        transcript, language, audio_duration = transcribe_video(video_path)
        if not transcript:
            raise HTTPException(
                status_code=422,
                detail="No transcript was produced (empty or silent audio)",
            )

        return {
            "success": True,
            "transcript": transcript,
            "language": language,
            "duration": float(duration or audio_duration or 0),
            "model": WHISPER_MODEL,
        }
    except HTTPException as exc:
        raise exc
    except Exception as exc:  # noqa: BLE001
        logger.exception("Transcribe failed for %s", video_url)
        raise HTTPException(
            status_code=500, detail=f"Transcription failed: {exc}"
        ) from exc
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)
        logger.info("Request took %.2f s", time.time() - start)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=PORT, log_level="info")
