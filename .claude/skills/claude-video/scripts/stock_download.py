#!/usr/bin/env python3
"""Download and preprocess a stock video for Remotion embedding.

Usage:
    stock_download.py --url "https://..." --output public/stock/hook.mp4 [options]

Options:
    --target-fps 30             Target framerate (default: 30)
    --target-width 1920         Target width (default: 1920)
    --target-height 1080        Target height (default: 1080)
    --trim-duration N           Trim to N seconds (optional)
    --gpu                       Use NVENC hardware encoding
"""

import argparse
import json
import os
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path


def download_file(url, output_path):
    """Download a file from URL."""
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (compatible; PromoVideoBot/1.0)"
    })
    with urllib.request.urlopen(req, timeout=120) as resp:
        Path(output_path).write_bytes(resp.read())
    return Path(output_path).stat().st_size


def has_audio_stream(input_path):
    """Check if a video file has an audio stream."""
    cmd = [
        "ffprobe", "-v", "quiet", "-select_streams", "a",
        "-show_entries", "stream=codec_type",
        "-of", "csv=p=0", str(input_path)
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return "audio" in result.stdout.lower()


def preprocess_video(input_path, output_path, fps=30, width=1920, height=1080,
                     trim_duration=None, use_gpu=False):
    """Preprocess video: scale, fps, codec. Handles videos with or without audio."""
    vf = (
        f"scale={width}:{height}:force_original_aspect_ratio=decrease,"
        f"pad={width}:{height}:(ow-iw)/2:(oh-ih)/2:black,"
        f"fps={fps}"
    )

    if use_gpu:
        # NVENC: -cq for constant quality mode (no -b:v needed)
        codec_args = ["-c:v", "h264_nvenc", "-preset", "p5", "-tune", "hq",
                      "-cq", "20"]
    else:
        codec_args = ["-c:v", "libx264", "-preset", "medium", "-crf", "18"]

    cmd = ["ffmpeg", "-y", "-i", str(input_path)]

    if trim_duration:
        cmd += ["-t", str(trim_duration)]

    cmd += ["-vf", vf] + codec_args

    # Only encode audio if input has an audio stream
    if has_audio_stream(input_path):
        cmd += ["-c:a", "aac", "-b:a", "128k"]
    else:
        cmd += ["-an"]  # no audio

    cmd += ["-movflags", "+faststart", str(output_path)]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        return {"error": True, "message": result.stderr[-500:]}

    size_mb = Path(output_path).stat().st_size / 1024 / 1024
    return {"success": True, "path": str(output_path), "size_mb": round(size_mb, 1)}


def main():
    parser = argparse.ArgumentParser(description="Download + preprocess stock video")
    parser.add_argument("--url", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--target-fps", type=int, default=30)
    parser.add_argument("--target-width", type=int, default=1920)
    parser.add_argument("--target-height", type=int, default=1080)
    parser.add_argument("--trim-duration", type=float, default=None)
    parser.add_argument("--gpu", action="store_true")

    args = parser.parse_args()

    Path(args.output).parent.mkdir(parents=True, exist_ok=True)

    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        print(json.dumps({"status": "downloading", "url": args.url[:100]}),
              file=sys.stderr)
        size = download_file(args.url, tmp_path)
        print(json.dumps({"status": "downloaded",
                          "size_mb": round(size / 1024 / 1024, 1)}),
              file=sys.stderr)

        print(json.dumps({"status": "preprocessing"}), file=sys.stderr)
        result = preprocess_video(
            tmp_path, args.output,
            fps=args.target_fps,
            width=args.target_width,
            height=args.target_height,
            trim_duration=args.trim_duration,
            use_gpu=args.gpu,
        )

        print(json.dumps(result))
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


if __name__ == "__main__":
    main()
