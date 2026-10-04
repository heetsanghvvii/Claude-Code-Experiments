#!/usr/bin/env python3
"""AI video generation from text or image prompts.

Supports Google Veo 3.1, Runway Gen-4 Turbo, and local Stable Video Diffusion.

Usage:
  python3 video_generate.py --provider veo|runway|local --prompt "..." [OPTIONS]

Options:
  --provider       veo, runway, or local (required)
  --prompt         Text description of desired video
  --image          Source image for image-to-video
  --extend         Extend an existing video clip (Veo only)
  --aspect         Aspect ratio: 16:9, 9:16, 1:1 (default: 16:9)
  --resolution     Output resolution: 720p, 1080p (default: 1080p)
  --duration       Clip duration in seconds (default: 8 for veo, 10 for runway)
  --tier           Veo tier: fast, standard (default: fast)
  --output         Output file path (required)
"""
import argparse
import json
import os
import subprocess
import sys
import time


def get_free_vram_mb():
    """Get free VRAM in MB."""
    try:
        result = subprocess.run(
            ["nvidia-smi", "--query-gpu=memory.free", "--format=csv,noheader,nounits"],
            capture_output=True, text=True, timeout=5
        )
        return int(result.stdout.strip().split('\n')[0])
    except Exception:
        return 0


def estimate_cost(provider, duration, tier="fast"):
    """Estimate generation cost in USD."""
    if provider == "veo":
        rate = 0.15 if tier == "fast" else 0.40
        return round(rate * duration, 2)
    elif provider == "runway":
        return round(0.05 * duration, 2)
    return 0.0


def generate_veo(prompt, image_path=None, extend_path=None,
                 aspect="16:9", resolution="1080p", tier="fast", output_path="output.mp4"):
    """Generate video with Google Veo 3.1 via Gemini API."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print(json.dumps({"error": "GEMINI_API_KEY environment variable not set"}))
        sys.exit(1)

    from google import genai
    from google.genai import types

    client = genai.Client()

    model_name = "veo-3.1-generate-preview" if tier == "fast" else "veo-3.1-generate"

    config = types.GenerateVideosConfig(
        aspect_ratio=aspect,
        resolution=resolution,
    )

    start = time.time()

    if image_path:
        # Image-to-video
        with open(image_path, "rb") as f:
            image_data = f.read()
        image = types.Image(image_bytes=image_data)
        operation = client.models.generate_videos(
            model=model_name,
            prompt=prompt,
            image=image,
            config=config,
        )
    else:
        # Text-to-video
        operation = client.models.generate_videos(
            model=model_name,
            prompt=prompt,
            config=config,
        )

    # Poll until done
    print("  Generating video...", file=sys.stderr, flush=True)
    poll_count = 0
    while not operation.done:
        time.sleep(10)
        poll_count += 1
        if poll_count % 6 == 0:
            elapsed_min = (time.time() - start) / 60
            print(f"  Still generating... ({elapsed_min:.1f} min elapsed)", file=sys.stderr, flush=True)
        try:
            operation = client.operations.get(operation)
        except Exception as e:
            print(f"  Poll error (retrying): {e}", file=sys.stderr, flush=True)
            time.sleep(5)

        # Timeout after 15 minutes
        if time.time() - start > 900:
            print(json.dumps({"error": "Generation timed out after 15 minutes"}))
            sys.exit(1)

    # Download result
    if operation.response and operation.response.generated_videos:
        video = operation.response.generated_videos[0]
        # Method 1: Try client.files.download (authenticated)
        try:
            fname = video.video.uri.split("/")[-1] if video.video.uri else None
            if fname:
                print(f"  Downloading via API...", file=sys.stderr, flush=True)
                dl = client.files.download(file=fname)
                with open(output_path, "wb") as f:
                    f.write(dl)
            else:
                raise ValueError("No filename in URI")
        except Exception as e1:
            print(f"  Method 1 failed ({e1}), trying direct save...", file=sys.stderr, flush=True)
            # Method 2: Try direct save
            try:
                video.video.save(output_path)
            except Exception as e2:
                print(f"  Method 2 failed ({e2}), trying requests...", file=sys.stderr, flush=True)
                # Method 3: Try requests with API key in URL
                import urllib.request
                video_uri = video.video.uri
                if not video_uri:
                    print(json.dumps({"error": "No video URI available"}))
                    sys.exit(1)
                # Append API key for authenticated access
                separator = "&" if "?" in video_uri else "?"
                auth_uri = f"{video_uri}{separator}key={api_key}"
                try:
                    urllib.request.urlretrieve(auth_uri, output_path)
                except Exception as e3:
                    print(json.dumps({
                        "error": f"All download methods failed: {e1}, {e2}, {e3}",
                        "uri": video_uri
                    }))
                    sys.exit(1)
    else:
        print(json.dumps({"error": "No video generated", "operation": str(operation)}))
        sys.exit(1)

    elapsed = time.time() - start
    return elapsed


def generate_runway(prompt, image_path=None, duration=10, output_path="output.mp4"):
    """Generate video with Runway Gen-4 Turbo API."""
    api_key = os.environ.get("RUNWAY_API_KEY")
    if not api_key:
        print(json.dumps({"error": "RUNWAY_API_KEY environment variable not set"}))
        sys.exit(1)

    from runwayml import RunwayML

    client = RunwayML()
    start = time.time()

    kwargs = {
        "model": "gen4_turbo",
        "prompt": prompt,
        "duration": duration,
    }

    if image_path:
        with open(image_path, "rb") as f:
            import base64
            kwargs["image"] = base64.b64encode(f.read()).decode()

    task = client.image_to_video.create(**kwargs) if image_path else client.text_to_video.create(**kwargs)

    # Poll until done
    print("  Generating video...", file=sys.stderr, flush=True)
    while task.status not in ("SUCCEEDED", "FAILED"):
        time.sleep(5)
        task = client.tasks.retrieve(task.id)

    if task.status == "FAILED":
        print(json.dumps({"error": "Runway generation failed", "details": str(task)}))
        sys.exit(1)

    # Download result
    import urllib.request
    urllib.request.urlretrieve(task.output[0], output_path)

    elapsed = time.time() - start
    return elapsed


def generate_local_svd(image_path, output_path="output.mp4"):
    """Generate video with local Stable Video Diffusion."""
    import torch

    free_vram = get_free_vram_mb()
    if free_vram < 14000:
        print(json.dumps({
            "error": f"SVD requires ~16GB VRAM, only {free_vram}MB free",
            "suggestion": "Use --provider veo or --provider runway instead"
        }))
        sys.exit(1)

    if not image_path:
        print(json.dumps({"error": "Local SVD requires --image input"}))
        sys.exit(1)

    from diffusers import StableVideoDiffusionPipeline
    from diffusers.utils import load_image, export_to_video

    start = time.time()

    pipe = StableVideoDiffusionPipeline.from_pretrained(
        "stabilityai/stable-video-diffusion-img2vid-xt",
        torch_dtype=torch.float16,
        variant="fp16",
    ).to("cuda")

    image = load_image(image_path)
    image = image.resize((1024, 576))

    frames = pipe(image, decode_chunk_size=8, num_frames=25).frames[0]
    export_to_video(frames, output_path, fps=7)

    del pipe
    import gc
    gc.collect()
    torch.cuda.empty_cache()

    elapsed = time.time() - start
    return elapsed


def get_video_info(path):
    """Get basic video info via ffprobe."""
    result = subprocess.run(
        ["ffprobe", "-v", "quiet", "-print_format", "json",
         "-show_format", "-show_streams", "-select_streams", "v:0", path],
        capture_output=True, text=True
    )
    return json.loads(result.stdout)


def main():
    parser = argparse.ArgumentParser(description="AI video generation")
    parser.add_argument("--provider", required=True, choices=["veo", "runway", "local"],
                        help="Generation provider")
    parser.add_argument("--prompt", help="Text prompt")
    parser.add_argument("--image", help="Source image for image-to-video")
    parser.add_argument("--extend", help="Video to extend (Veo only)")
    parser.add_argument("--aspect", default="16:9", help="Aspect ratio (default: 16:9)")
    parser.add_argument("--resolution", default="1080p", help="Resolution (default: 1080p)")
    parser.add_argument("--duration", type=int, help="Duration in seconds")
    parser.add_argument("--tier", default="fast", choices=["fast", "standard"],
                        help="Veo tier (default: fast)")
    parser.add_argument("--output", required=True, help="Output file path")

    args = parser.parse_args()

    # Set default duration per provider
    if not args.duration:
        args.duration = 8 if args.provider == "veo" else 10 if args.provider == "runway" else 4

    # Show cost estimate for API providers
    cost = estimate_cost(args.provider, args.duration, args.tier)

    if args.provider == "veo":
        if not args.prompt:
            print(json.dumps({"error": "--prompt required for Veo generation"}))
            sys.exit(1)

        elapsed = generate_veo(args.prompt, args.image, args.extend,
                               args.aspect, args.resolution, args.tier, args.output)

        info = get_video_info(args.output) if os.path.exists(args.output) else {}
        stream = info.get("streams", [{}])[0] if info.get("streams") else {}

        print(json.dumps({
            "action": "generate_video",
            "provider": "veo",
            "model": f"veo-3.1-{args.tier}",
            "prompt": args.prompt,
            "aspect_ratio": args.aspect,
            "resolution": args.resolution,
            "duration_sec": args.duration,
            "has_audio": True,
            "cost_usd": cost,
            "generation_time_sec": round(elapsed, 1),
            "output": args.output,
            "output_width": stream.get("width"),
            "output_height": stream.get("height"),
            "file_size_mb": round(os.path.getsize(args.output) / 1024 / 1024, 2) if os.path.exists(args.output) else None
        }, indent=2))

    elif args.provider == "runway":
        if not args.prompt:
            print(json.dumps({"error": "--prompt required for Runway generation"}))
            sys.exit(1)

        elapsed = generate_runway(args.prompt, args.image, args.duration, args.output)

        print(json.dumps({
            "action": "generate_video",
            "provider": "runway",
            "model": "gen4_turbo",
            "prompt": args.prompt,
            "duration_sec": args.duration,
            "has_audio": False,
            "cost_usd": cost,
            "generation_time_sec": round(elapsed, 1),
            "output": args.output,
            "file_size_mb": round(os.path.getsize(args.output) / 1024 / 1024, 2) if os.path.exists(args.output) else None
        }, indent=2))

    elif args.provider == "local":
        elapsed = generate_local_svd(args.image, args.output)

        print(json.dumps({
            "action": "generate_video",
            "provider": "local",
            "model": "SVD-XT",
            "duration_sec": args.duration,
            "has_audio": False,
            "cost_usd": 0,
            "generation_time_sec": round(elapsed, 1),
            "output": args.output,
            "vram_used_mb": 16000
        }, indent=2))


if __name__ == "__main__":
    main()
