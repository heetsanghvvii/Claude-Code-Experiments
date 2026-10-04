#!/usr/bin/env python3
"""Analyze video frames for luminance/contrast to guide adaptive text placement.

Extracts 1 frame per second, computes a 4x3 luminance grid per frame,
and outputs a contrast map JSON.

Usage:
    analyze_contrast.py --input public/stock/hook.mp4 --output public/stock/hook-contrast.json

Output format:
    {
      "clip": "public/stock/hook.mp4",
      "interval_sec": 1.0,
      "grid_rows": 3,
      "grid_cols": 4,
      "frames": [
        {
          "time_sec": 0.0,
          "zones": [[0.12, 0.15, 0.08, 0.22], ...],  // 3 rows x 4 cols
          "avg_luminance": 0.24,
          "classification": "dark"
        }
      ]
    }
"""

import argparse
import json
import os
import struct
import subprocess
import sys
import tempfile
from pathlib import Path

# Grid resolution: 4 columns x 3 rows = 12 zones
GRID_COLS = 4
GRID_ROWS = 3
# Thumbnail size for analysis (tiny = fast)
THUMB_W = 48
THUMB_H = 27


def get_video_duration(input_path):
    """Get video duration in seconds."""
    cmd = [
        "ffprobe", "-v", "quiet", "-show_entries", "format=duration",
        "-of", "csv=p=0", str(input_path)
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    try:
        return float(result.stdout.strip())
    except (ValueError, AttributeError):
        print(json.dumps({"error": True,
            "message": f"Could not get duration from: {input_path}"}))
        sys.exit(1)


def extract_frame_rgb(input_path, time_sec):
    """Extract a single frame as raw RGB bytes at thumbnail size."""
    cmd = [
        "ffmpeg", "-ss", str(time_sec), "-i", str(input_path),
        "-frames:v", "1",
        "-vf", f"scale={THUMB_W}:{THUMB_H}",
        "-pix_fmt", "rgb24",
        "-f", "rawvideo",
        "-"
    ]
    result = subprocess.run(cmd, capture_output=True)
    if result.returncode != 0 or len(result.stdout) == 0:
        return None
    return result.stdout


def compute_luminance_grid(rgb_data):
    """Compute 4x3 luminance grid from raw RGB frame data."""
    expected_size = THUMB_W * THUMB_H * 3
    if len(rgb_data) < expected_size:
        return None

    # Parse all pixels
    pixels = []
    for i in range(0, expected_size, 3):
        r, g, b = rgb_data[i], rgb_data[i + 1], rgb_data[i + 2]
        # Relative luminance (sRGB approximation)
        lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255.0
        pixels.append(lum)

    # Build 2D grid — use boundary-aware ranges to include all pixels
    grid = []

    for row in range(GRID_ROWS):
        row_zones = []
        # Distribute pixels evenly: first zones get extra pixel if not divisible
        y_start = (row * THUMB_H) // GRID_ROWS
        y_end = ((row + 1) * THUMB_H) // GRID_ROWS
        for col in range(GRID_COLS):
            x_start = (col * THUMB_W) // GRID_COLS
            x_end = ((col + 1) * THUMB_W) // GRID_COLS
            zone_sum = 0.0
            zone_count = 0
            for y in range(y_start, y_end):
                for x in range(x_start, x_end):
                    idx = y * THUMB_W + x
                    if idx < len(pixels):
                        zone_sum += pixels[idx]
                        zone_count += 1
            avg = zone_sum / max(zone_count, 1)
            row_zones.append(round(avg, 3))
        grid.append(row_zones)

    return grid


def classify_luminance(avg):
    """Classify average luminance."""
    if avg < 0.3:
        return "dark"
    elif avg < 0.6:
        return "mid"
    else:
        return "bright"


def analyze_video(input_path, interval=1.0):
    """Analyze entire video at given interval."""
    duration = get_video_duration(input_path)
    frames = []

    time_sec = 0.0
    while time_sec < duration:
        rgb = extract_frame_rgb(input_path, time_sec)
        if rgb is None:
            time_sec += interval
            continue

        grid = compute_luminance_grid(rgb)
        if grid is None:
            time_sec += interval
            continue

        # Average luminance across all zones
        all_zones = [v for row in grid for v in row]
        avg = sum(all_zones) / len(all_zones)

        frames.append({
            "time_sec": round(time_sec, 1),
            "zones": grid,
            "avg_luminance": round(avg, 3),
            "classification": classify_luminance(avg),
        })

        print(json.dumps({"status": "analyzed", "time": round(time_sec, 1),
                          "avg": round(avg, 3), "class": classify_luminance(avg)}),
              file=sys.stderr)

        time_sec += interval

    return {
        "clip": str(input_path),
        "interval_sec": interval,
        "grid_rows": GRID_ROWS,
        "grid_cols": GRID_COLS,
        "duration_sec": round(duration, 1),
        "frames": frames,
    }


def main():
    parser = argparse.ArgumentParser(description="Analyze video contrast for adaptive text")
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--interval", type=float, default=1.0,
                       help="Seconds between frame samples")

    args = parser.parse_args()

    if not Path(args.input).exists():
        print(json.dumps({"error": True, "message": f"File not found: {args.input}"}))
        sys.exit(1)

    result = analyze_video(args.input, args.interval)

    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    Path(args.output).write_text(json.dumps(result, indent=2))

    print(json.dumps({
        "success": True,
        "path": args.output,
        "frames_analyzed": len(result["frames"]),
        "duration_sec": result["duration_sec"],
    }))


if __name__ == "__main__":
    main()
