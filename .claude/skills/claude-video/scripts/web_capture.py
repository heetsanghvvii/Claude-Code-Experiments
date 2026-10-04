#!/usr/bin/env python3
"""Web screenshot and recording capture for video production using Playwright.

Usage:
  python3 web_capture.py --url URL --output FILE [OPTIONS]
  python3 web_capture.py --urls FILE --output-dir DIR [OPTIONS]
  python3 web_capture.py --ken-burns-image FILE --output FILE [OPTIONS]
  python3 web_capture.py --record --url URL --output FILE [OPTIONS]

Options:
  --viewport WxH         Browser viewport (default: 1920x1080)
  --preset               Preset: landscape, portrait, square, instagram, 4k
  --full-page            Capture entire scrollable page
  --element SELECTOR     Capture specific element
  --transparent          Transparent background
  --hide SELECTORS       CSS selectors to hide (comma-separated)
  --inject-css CSS       Custom CSS to inject
  --wait N               Wait N seconds after load
  --wait-for SELECTOR    Wait for element to appear
  --device NAME          Device emulation preset
  --dark-mode            Emulate dark color scheme
  --record               Record browser session as video
  --duration N           Recording duration in seconds
  --scroll               Auto-scroll during recording
  --scroll-speed N       Pixels per second (default: 200)
  --ken-burns            Generate Ken Burns video from screenshot
  --ken-burns-image      Apply Ken Burns to existing image
  --ken-burns-duration N Duration in seconds (default: 5)
  --ken-burns-direction  zoom-in, zoom-out, pan-left, pan-right (default: zoom-in)
"""
import argparse
import json
import os
import subprocess
import sys
import tempfile
import time
from pathlib import Path


PRESETS = {
    "landscape": (1920, 1080),
    "portrait": (1080, 1920),
    "square": (1080, 1080),
    "instagram": (1080, 1350),
    "4k": (3840, 2160),
}


def parse_viewport(viewport_str):
    """Parse 'WxH' string into tuple."""
    parts = viewport_str.lower().split("x")
    return int(parts[0]), int(parts[1])


def capture_screenshot(url, output, viewport=(1920, 1080), full_page=False,
                       element=None, transparent=False, hide=None, inject_css=None,
                       wait=0, wait_for=None, device=None, dark_mode=False):
    """Capture screenshot with Playwright."""
    from playwright.sync_api import sync_playwright

    start = time.time()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Context options
        ctx_opts = {}

        if device:
            dev = p.devices.get(device)
            if dev:
                ctx_opts.update(dev)
            else:
                print(f"Warning: Unknown device '{device}', using default viewport",
                      file=sys.stderr)

        if not device:
            ctx_opts["viewport"] = {"width": viewport[0], "height": viewport[1]}

        if dark_mode:
            ctx_opts["color_scheme"] = "dark"

        context = browser.new_context(**ctx_opts)
        page = context.new_page()

        # Navigate
        page.goto(url, wait_until="networkidle", timeout=30000)

        # Wait
        if wait > 0:
            page.wait_for_timeout(wait * 1000)

        if wait_for:
            page.wait_for_selector(wait_for, timeout=10000)

        # Hide elements
        if hide:
            selectors = hide.split(",")
            for sel in selectors:
                sel = sel.strip()
                page.evaluate(f"""
                    document.querySelectorAll('{sel}').forEach(el => {{
                        el.style.display = 'none';
                    }});
                """)

        # Inject CSS
        if inject_css:
            page.evaluate(f"""
                const style = document.createElement('style');
                style.textContent = `{inject_css}`;
                document.head.appendChild(style);
            """)

        # Wait for styles to apply
        page.wait_for_timeout(500)

        # Capture
        screenshot_opts = {"path": output}
        if full_page:
            screenshot_opts["full_page"] = True
        if transparent:
            screenshot_opts["omit_background"] = True

        if element:
            page.locator(element).screenshot(**screenshot_opts)
        else:
            page.screenshot(**screenshot_opts)

        context.close()
        browser.close()

    elapsed = time.time() - start
    file_size = os.path.getsize(output)
    return elapsed, file_size


def record_session(url, output, viewport=(1920, 1080), duration=10,
                   scroll=False, scroll_speed=200, device=None, dark_mode=False):
    """Record browser session as video."""
    from playwright.sync_api import sync_playwright

    start = time.time()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        ctx_opts = {
            "record_video_dir": tempfile.mkdtemp(),
            "record_video_size": {"width": viewport[0], "height": viewport[1]},
        }

        if device:
            dev = p.devices.get(device)
            if dev:
                ctx_opts.update(dev)
        else:
            ctx_opts["viewport"] = {"width": viewport[0], "height": viewport[1]}

        if dark_mode:
            ctx_opts["color_scheme"] = "dark"

        context = browser.new_context(**ctx_opts)
        page = context.new_page()

        page.goto(url, wait_until="networkidle", timeout=30000)

        if scroll:
            # Auto-scroll
            scroll_distance = 0
            target_distance = scroll_speed * duration
            interval = 100  # ms
            px_per_interval = scroll_speed * interval / 1000

            elapsed_scroll = 0
            while elapsed_scroll < duration * 1000:
                page.evaluate(f"window.scrollBy(0, {px_per_interval})")
                page.wait_for_timeout(interval)
                elapsed_scroll += interval
        else:
            page.wait_for_timeout(duration * 1000)

        # Get recording path
        video_path = page.video.path()
        context.close()
        browser.close()

        # Move recording to output
        if video_path and os.path.exists(video_path):
            # Re-encode to proper format
            subprocess.run(
                ["ffmpeg", "-y", "-i", video_path,
                 "-c:v", "libx264", "-crf", "18", "-preset", "fast",
                 "-pix_fmt", "yuv420p", "-movflags", "+faststart",
                 output],
                capture_output=True, check=True
            )
            os.unlink(video_path)

    elapsed = time.time() - start
    return elapsed


def ken_burns(image_path, output_path, duration=5, direction="zoom-in",
              output_width=1920, output_height=1080):
    """Apply Ken Burns effect to a static image."""
    start = time.time()

    # Direction-specific zoompan parameters
    if direction == "zoom-in":
        vf = (f"scale=8000:-1,zoompan=z='zoom+0.001':"
              f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
              f"d={duration}*60:s={output_width}x{output_height}:fps=60")
    elif direction == "zoom-out":
        vf = (f"scale=8000:-1,zoompan=z='1.5-on/{duration}/60*0.5':"
              f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
              f"d={duration}*60:s={output_width}x{output_height}:fps=60")
    elif direction == "pan-left":
        vf = (f"scale=8000:-1,zoompan=z='1.2':"
              f"x='iw-iw/zoom-on/(on+1)*(iw-iw/zoom)':y='ih/2-(ih/zoom/2)':"
              f"d={duration}*60:s={output_width}x{output_height}:fps=60")
    elif direction == "pan-right":
        vf = (f"scale=8000:-1,zoompan=z='1.2':"
              f"x='on/(on+1)*(iw-iw/zoom)':y='ih/2-(ih/zoom/2)':"
              f"d={duration}*60:s={output_width}x{output_height}:fps=60")
    else:
        vf = (f"scale=8000:-1,zoompan=z='zoom+0.001':"
              f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
              f"d={duration}*60:s={output_width}x{output_height}:fps=60")

    subprocess.run(
        ["ffmpeg", "-y", "-loop", "1", "-framerate", "60", "-i", image_path,
         "-vf", vf, "-t", str(duration),
         "-c:v", "libx264", "-pix_fmt", "yuv420p",
         "-movflags", "+faststart", output_path],
        capture_output=True, check=True
    )

    elapsed = time.time() - start
    return elapsed


def batch_capture(urls_file, output_dir, **kwargs):
    """Capture screenshots for multiple URLs."""
    os.makedirs(output_dir, exist_ok=True)

    with open(urls_file) as f:
        urls = [line.strip() for line in f if line.strip() and not line.startswith("#")]

    results = []
    for i, url in enumerate(urls):
        # Generate filename from URL
        slug = url.replace("https://", "").replace("http://", "")
        slug = slug.replace("/", "_").replace(".", "_")[:60]
        output = os.path.join(output_dir, f"{i+1:03d}_{slug}.png")

        try:
            elapsed, file_size = capture_screenshot(url, output, **kwargs)
            results.append({
                "url": url,
                "output": output,
                "file_size_bytes": file_size,
                "capture_time_sec": round(elapsed, 2),
                "status": "success"
            })
        except Exception as e:
            results.append({
                "url": url,
                "status": "error",
                "error": str(e)
            })

    return results


def main():
    parser = argparse.ArgumentParser(description="Web capture for video production")
    parser.add_argument("--url", help="URL to capture")
    parser.add_argument("--urls", help="File with URLs (one per line)")
    parser.add_argument("--output", help="Output file path")
    parser.add_argument("--output-dir", help="Output directory for batch/recording")
    parser.add_argument("--viewport", default="1920x1080", help="Viewport WxH (default: 1920x1080)")
    parser.add_argument("--preset", choices=PRESETS.keys(), help="Viewport preset")
    parser.add_argument("--full-page", action="store_true", help="Full page screenshot")
    parser.add_argument("--element", help="CSS selector for element capture")
    parser.add_argument("--transparent", action="store_true", help="Transparent background")
    parser.add_argument("--hide", help="CSS selectors to hide (comma-separated)")
    parser.add_argument("--inject-css", help="Custom CSS to inject")
    parser.add_argument("--wait", type=int, default=0, help="Wait seconds after load")
    parser.add_argument("--wait-for", help="Wait for CSS selector to appear")
    parser.add_argument("--device", help="Device emulation preset")
    parser.add_argument("--dark-mode", action="store_true", help="Dark color scheme")
    parser.add_argument("--record", action="store_true", help="Record browser session")
    parser.add_argument("--duration", type=int, default=10, help="Recording duration (default: 10)")
    parser.add_argument("--scroll", action="store_true", help="Auto-scroll during recording")
    parser.add_argument("--scroll-speed", type=int, default=200, help="Scroll speed px/s (default: 200)")
    parser.add_argument("--ken-burns", action="store_true", help="Generate Ken Burns from screenshot")
    parser.add_argument("--ken-burns-image", help="Apply Ken Burns to existing image")
    parser.add_argument("--ken-burns-duration", type=int, default=5, help="Ken Burns duration (default: 5)")
    parser.add_argument("--ken-burns-direction", default="zoom-in",
                        choices=["zoom-in", "zoom-out", "pan-left", "pan-right"],
                        help="Ken Burns direction (default: zoom-in)")

    args = parser.parse_args()

    # Resolve viewport
    if args.preset:
        viewport = PRESETS[args.preset]
    else:
        viewport = parse_viewport(args.viewport)

    # Ken Burns from existing image
    if args.ken_burns_image:
        if not args.output:
            print(json.dumps({"error": "--output required"}))
            sys.exit(1)
        elapsed = ken_burns(args.ken_burns_image, args.output,
                            args.ken_burns_duration, args.ken_burns_direction,
                            viewport[0], viewport[1])
        print(json.dumps({
            "action": "ken_burns",
            "input": args.ken_burns_image,
            "output": args.output,
            "duration_sec": args.ken_burns_duration,
            "direction": args.ken_burns_direction,
            "resolution": f"{viewport[0]}x{viewport[1]}",
            "processing_time_sec": round(elapsed, 2)
        }, indent=2))
        return

    # Batch capture
    if args.urls:
        if not args.output_dir:
            print(json.dumps({"error": "--output-dir required for batch capture"}))
            sys.exit(1)
        results = batch_capture(args.urls, args.output_dir,
                                viewport=viewport, full_page=args.full_page,
                                transparent=args.transparent, hide=args.hide,
                                inject_css=args.inject_css, wait=args.wait,
                                wait_for=args.wait_for, device=args.device,
                                dark_mode=args.dark_mode)
        success = sum(1 for r in results if r["status"] == "success")
        print(json.dumps({
            "action": "batch_capture",
            "urls_processed": len(results),
            "success": success,
            "failed": len(results) - success,
            "output_dir": args.output_dir,
            "results": results
        }, indent=2))
        return

    if not args.url:
        print(json.dumps({"error": "--url or --urls required"}))
        sys.exit(1)

    if not args.output:
        print(json.dumps({"error": "--output required"}))
        sys.exit(1)

    # Record mode
    if args.record:
        elapsed = record_session(args.url, args.output, viewport,
                                 args.duration, args.scroll, args.scroll_speed,
                                 args.device, args.dark_mode)
        print(json.dumps({
            "action": "record",
            "url": args.url,
            "output": args.output,
            "viewport": f"{viewport[0]}x{viewport[1]}",
            "duration_sec": args.duration,
            "recording_time_sec": round(elapsed, 2)
        }, indent=2))
        return

    # Single screenshot
    elapsed, file_size = capture_screenshot(
        args.url, args.output, viewport, args.full_page,
        args.element, args.transparent, args.hide, args.inject_css,
        args.wait, args.wait_for, args.device, args.dark_mode
    )

    result = {
        "action": "screenshot",
        "url": args.url,
        "output": args.output,
        "viewport": f"{viewport[0]}x{viewport[1]}",
        "full_page": args.full_page,
        "file_size_bytes": file_size,
        "capture_time_sec": round(elapsed, 2)
    }

    # Ken Burns conversion
    if args.ken_burns:
        kb_output = args.output.rsplit(".", 1)[0] + "_kenburns.mp4"
        kb_elapsed = ken_burns(args.output, kb_output,
                               args.ken_burns_duration, args.ken_burns_direction,
                               viewport[0], viewport[1])
        result["ken_burns_output"] = kb_output
        result["ken_burns_duration"] = args.ken_burns_duration
        result["ken_burns_time_sec"] = round(kb_elapsed, 2)

    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
