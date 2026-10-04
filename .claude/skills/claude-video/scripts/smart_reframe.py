#!/usr/bin/env python3
"""Content-aware smart reframe for vertical video (9:16).

Supports two layout modes:

**Screen mode (default for screen recordings):**
  "Framed" layout — content zoomed out with dark padding for a designed feel:
  - Top zone: dark padding for hook text overlay (~200px)
  - Content: cropped + scaled screen content, readable on mobile
  - Bottom zone: dark padding for animated captions (~350px)

**Talking-head mode:**
  Face-tracked center crop to 9:16 (delegates to face_tracker.py).

VLM-identified zoom regions control WHERE to crop horizontally. The pipeline
sends zoom data from frame_analyzer.py which tells us what content is important
and where it sits in the source frame.

Usage:
  python3 smart_reframe.py INPUT OUTPUT --zoom-data zoom.json [OPTIONS]

zoom.json format (array of timed crop positions):
  [
    {"t": 0.0, "x_pct": 0.22, "y_pct": 0.0, "w_pct": 0.44, "h_pct": 1.0},
    {"t": 15.0, "x_pct": 0.35, "y_pct": 0.0, "w_pct": 0.44, "h_pct": 1.0}
  ]

If only one region is provided, static crop is used. If multiple, the crop
cuts between regions at each timestamp (jump cut, not smooth pan — matches
natural scroll/section transitions in screen recordings).
"""
import argparse
import json
import os
import subprocess
import sys
import tempfile


def get_video_info(path):
    """Get video width, height, fps, and duration via ffprobe."""
    result = subprocess.run(
        ["ffprobe", "-v", "quiet", "-print_format", "json",
         "-show_streams", "-show_format", "-select_streams", "v:0", path],
        capture_output=True, text=True
    )
    data = json.loads(result.stdout)
    stream = data["streams"][0]
    fmt = data.get("format", {})
    w = int(stream["width"])
    h = int(stream["height"])
    fps_str = stream.get("r_frame_rate", "30/1")
    num, den = fps_str.split("/")
    fps = round(float(num) / float(den))
    duration = float(fmt.get("duration", stream.get("duration", 0)))
    return w, h, fps, duration


def compute_crop_params(src_w, src_h, region, out_w=1080, content_h=1372):
    """Compute absolute crop coordinates from a zoom region.

    The crop width is derived from the desired content height to maintain
    the correct aspect ratio after scaling to out_w.

    For the "framed" layout: we crop a region from source, scale it to
    out_w x content_h, then pad to out_w x 1920 with dark bars.

    The crop width = src_h * (out_w / content_h) gives us the right ratio.
    But VLM data specifies WHERE to crop, so we use x_pct from zoom data
    as the center of the crop region.
    """
    # Calculate crop dimensions based on desired output content ratio
    # content aspect = out_w / content_h = 1080 / 1372
    # crop from source maintaining this ratio using full height
    crop_h = src_h  # always use full source height
    crop_w = int(crop_h * out_w / content_h)

    # Clamp crop_w to source width
    crop_w = min(crop_w, src_w)

    # Position crop based on VLM-suggested region
    # x_pct indicates where the interesting content is (0-1 of source width)
    # We center the crop on the content area
    content_center_x = int(region.get("x_pct", 0.5) * src_w +
                           region.get("w_pct", 0.3) * src_w / 2)
    crop_x = content_center_x - crop_w // 2

    # Clamp to source bounds
    crop_x = max(0, min(crop_x, src_w - crop_w))

    return crop_x, 0, crop_w, crop_h


def build_framed_filter(src_w, src_h, fps, duration, region,
                        top_pad=200, bottom_pad=348, out_w=1080,
                        hook_line1="", hook_line2="",
                        hook_font="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"):
    """Build FFmpeg filter for static framed layout (single zoom region)."""
    out_h = 1920
    content_h = out_h - top_pad - bottom_pad

    crop_x, crop_y, crop_w, crop_h = compute_crop_params(
        src_w, src_h, region, out_w, content_h
    )

    # Build filter chain: crop → scale → pad → mask chrome → hook text
    filters = [
        f"crop={crop_w}:{crop_h}:{crop_x}:{crop_y}",
        f"scale={out_w}:{content_h}",
        f"pad={out_w}:{out_h}:0:{top_pad}:black",
    ]

    # Mask VS Code chrome at content boundaries (thin dark bars)
    # Top of content: hide title bar (~22px after scale)
    filters.append(f"drawbox=x=0:y={top_pad}:w={out_w}:h=22:color=black:t=fill")
    # Bottom of content: hide status bar (~15px)
    content_bottom = top_pad + content_h - 15
    filters.append(f"drawbox=x=0:y={content_bottom}:w={out_w}:h=15:color=black:t=fill")

    # Hook text in top padding zone (first 3.5 seconds)
    if hook_line1:
        safe_line1 = hook_line1.replace("'", "\\'").replace(":", "\\:")
        filters.append(
            f"drawtext=fontfile={hook_font}:text='{safe_line1}'"
            f":fontcolor=white:fontsize=52:borderw=3:bordercolor=black"
            f":x=(w-text_w)/2:y=50:enable='between(t,0.3,3.5)'"
        )
    if hook_line2:
        safe_line2 = hook_line2.replace("'", "\\'").replace(":", "\\:")
        filters.append(
            f"drawtext=fontfile={hook_font}:text='{safe_line2}'"
            f":fontcolor=0x00BFFF:fontsize=32:borderw=2:bordercolor=black"
            f":x=(w-text_w)/2:y=115:enable='between(t,0.5,3.5)'"
        )

    fc = ",".join(filters)
    return fc, out_h


def build_animated_framed_filter(src_w, src_h, fps, duration, regions,
                                 top_pad=200, bottom_pad=348, out_w=1080,
                                 hook_line1="", hook_line2="",
                                 hook_font="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"):
    """Build FFmpeg filter with jump-cuts between zoom regions.

    For screen recordings, smooth panning looks unnatural. Instead, we use
    conditional crop expressions that jump between positions at each timestamp,
    matching natural scroll/section transitions.
    """
    out_h = 1920
    content_h = out_h - top_pad - bottom_pad

    # Sort regions by time
    regions = sorted(regions, key=lambda r: r["t"])

    # Compute crop params for each region
    crop_positions = []
    for r in regions:
        cx, cy, cw, ch = compute_crop_params(
            src_w, src_h, r, out_w, content_h
        )
        crop_positions.append({
            "t": r["t"],
            "x": cx, "y": cy, "w": cw, "h": ch,
        })

    # All regions should have same w and h (full height, fixed ratio)
    # Only x position changes between regions
    cw = crop_positions[0]["w"]
    ch = crop_positions[0]["h"]

    # Build piecewise constant x expression (jump cuts, not lerp)
    # if(lt(t,t1), x0, if(lt(t,t2), x1, x2))
    if len(crop_positions) == 1:
        cx_expr = str(crop_positions[0]["x"])
    else:
        cx_expr = str(crop_positions[-1]["x"])
        for i in range(len(crop_positions) - 2, -1, -1):
            t_next = crop_positions[i + 1]["t"]
            cx_expr = f"if(lt(t\\,{t_next})\\,{crop_positions[i]['x']}\\,{cx_expr})"

    # Build filter chain
    filters = [
        f"crop={cw}:{ch}:'{cx_expr}':0",
        f"scale={out_w}:{content_h}",
        f"pad={out_w}:{out_h}:0:{top_pad}:black",
    ]

    # Chrome masking
    filters.append(f"drawbox=x=0:y={top_pad}:w={out_w}:h=22:color=black:t=fill")
    content_bottom = top_pad + content_h - 15
    filters.append(f"drawbox=x=0:y={content_bottom}:w={out_w}:h=15:color=black:t=fill")

    # Hook text
    if hook_line1:
        safe_line1 = hook_line1.replace("'", "\\'").replace(":", "\\:")
        filters.append(
            f"drawtext=fontfile={hook_font}:text='{safe_line1}'"
            f":fontcolor=white:fontsize=52:borderw=3:bordercolor=black"
            f":x=(w-text_w)/2:y=50:enable='between(t,0.3,3.5)'"
        )
    if hook_line2:
        safe_line2 = hook_line2.replace("'", "\\'").replace(":", "\\:")
        filters.append(
            f"drawtext=fontfile={hook_font}:text='{safe_line2}'"
            f":fontcolor=0x00BFFF:fontsize=32:borderw=2:bordercolor=black"
            f":x=(w-text_w)/2:y=115:enable='between(t,0.5,3.5)'"
        )

    fc = ",".join(filters)
    return fc, out_h


def reframe(input_path, output_path, zoom_data, top_pad=200, bottom_pad=348,
            out_w=1080, crf=18, hook_line1="", hook_line2=""):
    """Run the smart reframe pipeline."""
    src_w, src_h, fps, duration = get_video_info(input_path)

    if not zoom_data:
        # Default: crop the right 44% of screen (skip sidebars, show content)
        zoom_data = [{"t": 0, "x_pct": 0.22, "y_pct": 0.0,
                      "w_pct": 0.44, "h_pct": 1.0}]

    if len(zoom_data) == 1:
        fc, out_h = build_framed_filter(
            src_w, src_h, fps, duration, zoom_data[0],
            top_pad, bottom_pad, out_w,
            hook_line1, hook_line2
        )
    else:
        fc, out_h = build_animated_framed_filter(
            src_w, src_h, fps, duration, zoom_data,
            top_pad, bottom_pad, out_w,
            hook_line1, hook_line2
        )

    # Write filter to temp file to avoid shell escaping issues with
    # complex expressions (hook text with special chars, nested if() etc.)
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
        f.write(fc)
        filter_file = f.name

    try:
        cmd = [
            "ffmpeg", "-y", "-i", input_path,
            "-filter_script:v", filter_file,
            "-c:v", "libx264", "-crf", str(crf), "-preset", "medium",
            "-profile:v", "high", "-level", "4.2",
            "-c:a", "aac", "-b:a", "192k",
            "-r", str(min(fps, 30)), "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            output_path
        ]

        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"FFmpeg error: {result.stderr[-500:]}", file=sys.stderr)
            sys.exit(1)
    finally:
        os.unlink(filter_file)

    # Verify output
    out_w_actual, out_h_actual, _, out_dur = get_video_info(output_path)
    file_size = os.path.getsize(output_path)

    output = {
        "action": "smart_reframe",
        "input": input_path,
        "output": output_path,
        "source_resolution": f"{src_w}x{src_h}",
        "output_resolution": f"{out_w_actual}x{out_h_actual}",
        "layout": {
            "mode": "framed",
            "top_padding": top_pad,
            "bottom_padding": bottom_pad,
            "content_height": out_h - top_pad - bottom_pad,
        },
        "zoom_regions": len(zoom_data),
        "animated": len(zoom_data) > 1,
        "duration": round(out_dur, 1),
        "file_size_mb": round(file_size / 1024 / 1024, 1),
    }
    print(json.dumps(output, indent=2))


def main():
    parser = argparse.ArgumentParser(
        description="Content-aware smart reframe for vertical video (framed layout)"
    )
    parser.add_argument("input", help="Input video file")
    parser.add_argument("output", help="Output reframed video file")
    parser.add_argument("--zoom-data", required=True,
                        help="JSON file with zoom region data (or inline JSON array)")
    parser.add_argument("--top-pad", type=int, default=200,
                        help="Top padding height for hook text (default: 200)")
    parser.add_argument("--bottom-pad", type=int, default=348,
                        help="Bottom padding height for captions (default: 348)")
    parser.add_argument("--output-width", type=int, default=1080,
                        help="Output width (default: 1080)")
    parser.add_argument("--crf", type=int, default=18,
                        help="CRF quality (default: 18)")
    parser.add_argument("--hook-line1", default="",
                        help="Primary hook text (top padding, first 3.5s)")
    parser.add_argument("--hook-line2", default="",
                        help="Secondary hook text (smaller, cyan, first 3.5s)")

    args = parser.parse_args()

    # Load zoom data from file or inline JSON
    if os.path.isfile(args.zoom_data):
        with open(args.zoom_data) as f:
            zoom_data = json.load(f)
    else:
        zoom_data = json.loads(args.zoom_data)

    # Normalize: accept single dict or array
    if isinstance(zoom_data, dict):
        zoom_data = [zoom_data]

    reframe(
        args.input, args.output, zoom_data,
        args.top_pad, args.bottom_pad,
        args.output_width, args.crf,
        args.hook_line1, args.hook_line2
    )


if __name__ == "__main__":
    main()
