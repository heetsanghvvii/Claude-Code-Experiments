#!/usr/bin/env python3
"""VLM-powered frame analysis for screen recording shorts pipeline.

Analyzes video frames using Gemini 2.5 Flash to identify:
- Visual interest score (1-10)
- Content type (code, table, chart, UI, webcam, title, blank)
- Key visual elements on screen
- Suggested zoom regions for 9:16 reframing

Usage:
  python3 frame_analyzer.py FRAMES_DIR [--output analysis.json] [--model gemini-2.5-flash]

Frames should be named with timestamps, e.g., frame_0300s.jpg (= 300 seconds).
"""
import argparse
import base64
import json
import os
import re
import sys
import time
from pathlib import Path


def encode_image(image_path):
    """Read image file and return base64-encoded string."""
    with open(image_path, "rb") as f:
        return base64.standard_b64encode(f.read()).decode("utf-8")


def get_mime_type(image_path):
    """Get MIME type from file extension."""
    ext = Path(image_path).suffix.lower()
    return {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
    }.get(ext, "image/jpeg")


def analyze_frame(client, model, image_path, timestamp_sec):
    """Analyze a single frame with VLM."""
    from google.genai import types

    mime = get_mime_type(image_path)
    image_data = encode_image(image_path)

    prompt = """Analyze this screen recording frame from a tutorial video. Return ONLY valid JSON (no markdown fences):

{
  "visual_interest": <1-10 integer>,
  "content_type": "<code|table|chart|text|ui|webcam|title|blank|mixed>",
  "key_elements": ["<element1>", "<element2>"],
  "readable_text_summary": "<brief summary of key text visible>",
  "suggested_zoom_region": {
    "x_pct": <0.0-1.0 left edge>,
    "y_pct": <0.0-1.0 top edge>,
    "w_pct": <0.1-1.0 width>,
    "h_pct": <0.1-1.0 height>,
    "description": "<what this region contains>"
  },
  "description": "<one-sentence description of what's shown>",
  "hook_potential": "<strong|medium|weak>",
  "standalone_value": "<high|medium|low>"
}

Scoring guide for visual_interest:
- 9-10: Data tables with scores, colorful charts, dramatic reveals, before/after
- 7-8: Code output with results, formatted reports, multi-panel views
- 5-6: Terminal/editor with commands running, progress indicators
- 3-4: Static text, documentation, single panel
- 1-2: Blank screen, loading, minimal content

For suggested_zoom_region: identify the MOST visually interesting/important area of the screen that would look good zoomed into on a phone (9:16 vertical). Coordinates are relative (0-1) where (0,0) is top-left."""

    response = client.models.generate_content(
        model=model,
        contents=[
            types.Content(
                role="user",
                parts=[
                    types.Part.from_bytes(
                        data=base64.standard_b64decode(image_data),
                        mime_type=mime,
                    ),
                    types.Part.from_text(text=prompt),
                ],
            )
        ],
    )

    # Parse JSON from response
    text = response.text.strip()
    # Remove markdown code fences if present
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)

    try:
        result = json.loads(text)
    except json.JSONDecodeError:
        result = {
            "visual_interest": 0,
            "content_type": "unknown",
            "key_elements": [],
            "readable_text_summary": "",
            "suggested_zoom_region": {
                "x_pct": 0.25, "y_pct": 0.1,
                "w_pct": 0.5, "h_pct": 0.8,
                "description": "center region (VLM parse failed)",
            },
            "description": f"VLM response parse failed: {text[:200]}",
            "hook_potential": "weak",
            "standalone_value": "low",
            "raw_response": text[:500],
        }

    result["timestamp_sec"] = timestamp_sec
    result["frame_path"] = str(image_path)
    return result


def extract_timestamp(filename):
    """Extract timestamp in seconds from filename like frame_0300s.jpg."""
    match = re.search(r"(\d+)s?\.", filename)
    if match:
        return int(match.group(1))
    # Try to extract from frame_XXXX pattern
    match = re.search(r"frame_(\d+)", filename)
    if match:
        return int(match.group(1))
    return 0


def main():
    parser = argparse.ArgumentParser(description="VLM frame analysis for shorts pipeline")
    parser.add_argument("frames_dir", help="Directory containing extracted frames")
    parser.add_argument("--output", "-o", default="frame_analysis.json",
                        help="Output JSON path (default: frame_analysis.json)")
    parser.add_argument("--model", default="gemini-2.5-flash",
                        help="Gemini model (default: gemini-2.5-flash)")
    parser.add_argument("--max-frames", type=int, default=40,
                        help="Maximum frames to analyze (default: 40)")

    args = parser.parse_args()

    # Check API key
    if not os.environ.get("GOOGLE_API_KEY"):
        print(json.dumps({"error": "GOOGLE_API_KEY not set"}))
        sys.exit(1)

    from google import genai
    client = genai.Client()

    # Find all image files
    frames_dir = Path(args.frames_dir)
    image_files = sorted(
        [f for f in frames_dir.iterdir() if f.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp")],
        key=lambda f: extract_timestamp(f.name),
    )

    if not image_files:
        print(json.dumps({"error": f"No image files found in {args.frames_dir}"}))
        sys.exit(1)

    # Limit frames
    if len(image_files) > args.max_frames:
        # Sample evenly
        step = len(image_files) / args.max_frames
        image_files = [image_files[int(i * step)] for i in range(args.max_frames)]

    print(f"Analyzing {len(image_files)} frames with {args.model}...", file=sys.stderr)

    results = []
    start_time = time.time()

    for i, frame_path in enumerate(image_files):
        timestamp = extract_timestamp(frame_path.name)
        mins = timestamp // 60
        secs = timestamp % 60

        print(f"  [{i + 1}/{len(image_files)}] Frame at {mins:02d}:{secs:02d}...",
              file=sys.stderr, end=" ", flush=True)

        try:
            result = analyze_frame(client, args.model, frame_path, timestamp)
            results.append(result)
            print(f"interest={result.get('visual_interest', '?')}/10 "
                  f"type={result.get('content_type', '?')}", file=sys.stderr)
        except Exception as e:
            print(f"ERROR: {e}", file=sys.stderr)
            results.append({
                "timestamp_sec": timestamp,
                "frame_path": str(frame_path),
                "visual_interest": 0,
                "error": str(e),
            })

        # Rate limiting (Gemini free tier: 15 RPM)
        if i < len(image_files) - 1:
            time.sleep(1.0)

    elapsed = time.time() - start_time

    # Sort by visual interest (descending)
    ranked = sorted(
        [r for r in results if r.get("visual_interest", 0) > 0],
        key=lambda r: r["visual_interest"],
        reverse=True,
    )

    output = {
        "frames_analyzed": len(results),
        "analysis_time_sec": round(elapsed, 1),
        "model": args.model,
        "top_moments": ranked[:10],
        "all_frames": results,
    }

    with open(args.output, "w") as f:
        json.dump(output, f, indent=2)

    # Print summary
    print(f"\nAnalysis complete: {len(results)} frames in {elapsed:.1f}s", file=sys.stderr)
    print(f"Output: {args.output}", file=sys.stderr)
    print(f"\nTop 5 moments by visual interest:", file=sys.stderr)
    for r in ranked[:5]:
        ts = r["timestamp_sec"]
        print(f"  {ts // 60:02d}:{ts % 60:02d} — interest={r['visual_interest']}/10 "
              f"type={r['content_type']} — {r.get('description', '')[:80]}",
              file=sys.stderr)

    # Print JSON summary to stdout
    print(json.dumps({
        "action": "frame_analysis",
        "frames_analyzed": len(results),
        "analysis_time_sec": round(elapsed, 1),
        "top_5": [
            {
                "timestamp": f"{r['timestamp_sec'] // 60:02d}:{r['timestamp_sec'] % 60:02d}",
                "visual_interest": r["visual_interest"],
                "content_type": r["content_type"],
                "description": r.get("description", "")[:100],
            }
            for r in ranked[:5]
        ],
    }, indent=2))


if __name__ == "__main__":
    main()
