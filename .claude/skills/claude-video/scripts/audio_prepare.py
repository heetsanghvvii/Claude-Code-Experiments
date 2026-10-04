#!/usr/bin/env python3
"""Audio preprocessing: normalize loudness, trim, loop/extend, measure duration.

Usage:
    audio_prepare.py --input music.mp3 --output public/music/bg.wav [options]

Options:
    --target-lufs -14       Target loudness in LUFS (default: -14, YouTube standard)
    --trim-duration N       Trim to N seconds (optional)
    --extend-duration N     Loop/extend to at least N seconds (optional)
    --fade-in N             Fade in duration in seconds (default: 0)
    --fade-out N            Fade out duration in seconds (default: 0)
    --fps 30                Frames per second for duration_frames output (default: 30)
    --format wav            Output format: wav or aac (default: wav)
"""

import argparse
import json
import math
import os
import subprocess
import sys
import tempfile
from pathlib import Path


def get_audio_info(input_path):
    """Get duration and loudness of an audio file."""
    # Duration
    cmd_dur = [
        "ffprobe", "-v", "quiet", "-show_entries", "format=duration",
        "-of", "csv=p=0", str(input_path)
    ]
    result = subprocess.run(cmd_dur, capture_output=True, text=True)
    try:
        duration = float(result.stdout.strip())
    except (ValueError, AttributeError):
        duration = 0.0

    # Loudness (pass 1 of loudnorm)
    cmd_loud = [
        "ffmpeg", "-i", str(input_path),
        "-af", "loudnorm=print_format=json",
        "-f", "null", "-"
    ]
    result = subprocess.run(cmd_loud, capture_output=True, text=True)
    loudness = -20.0  # default
    for line in result.stderr.split("\n"):
        if '"input_i"' in line:
            try:
                loudness = float(line.split(":")[1].strip().strip('",'))
            except (ValueError, IndexError):
                pass
            break

    return {"duration_sec": round(duration, 3), "loudness_lufs": round(loudness, 1)}


def normalize_loudness(input_path, output_path, target_lufs=-14):
    """Two-pass loudness normalization to target LUFS."""
    cmd = [
        "ffmpeg", "-y", "-i", str(input_path),
        "-af", f"loudnorm=I={target_lufs}:TP=-1.5:LRA=11",
        "-ar", "48000", "-ac", "2",
        str(output_path)
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.returncode == 0


def trim_audio(input_path, output_path, duration):
    """Trim audio to specific duration."""
    cmd = [
        "ffmpeg", "-y", "-i", str(input_path),
        "-t", str(duration), "-c", "copy",
        str(output_path)
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.returncode == 0


def extend_audio(input_path, output_path, target_duration):
    """Loop audio to reach target duration using concat."""
    info = get_audio_info(input_path)
    current_dur = info["duration_sec"]
    if current_dur <= 0:
        return False

    loops_needed = math.ceil(target_duration / current_dur)
    if loops_needed <= 1:
        # Already long enough, just copy
        cmd = ["ffmpeg", "-y", "-i", str(input_path), "-c", "copy", str(output_path)]
        subprocess.run(cmd, capture_output=True, text=True)
        return True

    # Create concat list
    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
        for _ in range(loops_needed):
            f.write(f"file '{input_path}'\n")
        concat_list = f.name

    try:
        cmd = [
            "ffmpeg", "-y", "-f", "concat", "-safe", "0",
            "-i", concat_list,
            "-t", str(target_duration),
            "-c", "copy",
            str(output_path)
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        return result.returncode == 0
    finally:
        os.unlink(concat_list)


def apply_fades(input_path, output_path, fade_in=0, fade_out=0, duration=None):
    """Apply fade in/out to audio."""
    filters = []
    if fade_in > 0:
        filters.append(f"afade=t=in:st=0:d={fade_in}")
    if fade_out > 0 and duration:
        fade_start = max(0, duration - fade_out)
        filters.append(f"afade=t=out:st={fade_start}:d={fade_out}")

    if not filters:
        return False

    cmd = [
        "ffmpeg", "-y", "-i", str(input_path),
        "-af", ",".join(filters),
        str(output_path)
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.returncode == 0


def main():
    parser = argparse.ArgumentParser(description="Audio preprocessing")
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--target-lufs", type=float, default=-14)
    parser.add_argument("--trim-duration", type=float, default=None)
    parser.add_argument("--extend-duration", type=float, default=None)
    parser.add_argument("--fade-in", type=float, default=0)
    parser.add_argument("--fade-out", type=float, default=0)
    parser.add_argument("--fps", type=int, default=30)
    parser.add_argument("--format", default="wav", choices=["wav", "aac"])

    args = parser.parse_args()

    if not Path(args.input).exists():
        print(json.dumps({"error": True, "message": f"File not found: {args.input}"}))
        sys.exit(1)

    Path(args.output).parent.mkdir(parents=True, exist_ok=True)

    # Work with temp files for intermediate steps
    current = args.input
    temps = []

    try:
        # Step 1: Extend if needed
        if args.extend_duration:
            tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False).name
            temps.append(tmp)
            print(json.dumps({"status": "extending", "target": args.extend_duration}),
                  file=sys.stderr)
            extend_audio(current, tmp, args.extend_duration)
            current = tmp

        # Step 2: Trim if needed
        if args.trim_duration:
            tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False).name
            temps.append(tmp)
            print(json.dumps({"status": "trimming", "target": args.trim_duration}),
                  file=sys.stderr)
            trim_audio(current, tmp, args.trim_duration)
            current = tmp

        # Step 3: Normalize loudness
        tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False).name
        temps.append(tmp)
        print(json.dumps({"status": "normalizing", "target_lufs": args.target_lufs}),
              file=sys.stderr)
        normalize_loudness(current, tmp, args.target_lufs)
        current = tmp

        # Step 4: Apply fades
        info = get_audio_info(current)
        if args.fade_in > 0 or args.fade_out > 0:
            tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False).name
            temps.append(tmp)
            print(json.dumps({"status": "fading", "in": args.fade_in, "out": args.fade_out}),
                  file=sys.stderr)
            apply_fades(current, tmp, args.fade_in, args.fade_out, info["duration_sec"])
            current = tmp

        # Step 5: Final output
        if args.format == "aac":
            cmd = ["ffmpeg", "-y", "-i", current, "-c:a", "aac", "-b:a", "192k", args.output]
        else:
            cmd = ["ffmpeg", "-y", "-i", current, "-c:a", "pcm_s16le",
                   "-ar", "48000", "-ac", "2", args.output]

        subprocess.run(cmd, capture_output=True, text=True)

        # Measure final output
        final_info = get_audio_info(args.output)
        duration_frames = int(final_info["duration_sec"] * args.fps)

        print(json.dumps({
            "success": True,
            "path": str(Path(args.output).resolve()),
            "duration_sec": final_info["duration_sec"],
            "duration_frames": duration_frames,
            "loudness_lufs": final_info["loudness_lufs"],
            "fps": args.fps,
        }))

    finally:
        for tmp in temps:
            try:
                os.unlink(tmp)
            except OSError:
                pass


if __name__ == "__main__":
    main()
