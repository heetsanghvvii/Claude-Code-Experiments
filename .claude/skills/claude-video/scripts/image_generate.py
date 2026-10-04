#!/usr/bin/env python3
"""AI image generation for video production.

Supports local generation (FLUX.2 klein, SD 3.5 Medium), API generation
(Gemini 3 Pro Image, OpenAI GPT Image 1) with background removal via rembg.

Usage:
  python3 image_generate.py --prompt "..." [--width W] [--height H] [--model flux|sd35medium]
      [--api gemini|openai] [--transparent] [--quality mini|medium|high]
      [--resolution 1K|2K|4K] [--aspect RATIO]
      [--quantize int8] [--seed N] [--batch N] [--output FILE]
  python3 image_generate.py --remove-bg INPUT --output FILE
  python3 image_generate.py --remove-bg-dir DIR --output-dir DIR
"""
import argparse
import json
import os
import subprocess
import sys
import time
from pathlib import Path


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


def ensure_vram(required_mb):
    """Ensure enough VRAM is available. Safe to call without torch installed."""
    try:
        import torch
        import gc
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            gc.collect()
            torch.cuda.empty_cache()
    except ImportError:
        pass  # No torch = no GPU, skip VRAM check
    free = get_free_vram_mb()
    if free < required_mb:
        print(json.dumps({
            "error": f"Insufficient VRAM: {free}MB free, {required_mb}MB required",
            "suggestion": "Close other GPU applications or use --api openai for API generation"
        }))
        return False
    return True


def generate_flux(prompt, width, height, quantize=None, seed=None, steps=4):
    """Generate image with FLUX.2 klein 4B locally."""
    import torch
    from diffusers import FluxPipeline

    required = 7000 if quantize else 13000
    if not ensure_vram(required):
        sys.exit(1)

    start = time.time()

    kwargs = {"torch_dtype": torch.bfloat16}

    if quantize == "int8":
        from transformers import BitsAndBytesConfig
        kwargs["quantization_config"] = BitsAndBytesConfig(load_in_8bit=True)

    pipe = FluxPipeline.from_pretrained(
        "black-forest-labs/FLUX.2-klein-4B",
        **kwargs
    )

    if not quantize:
        pipe = pipe.to("cuda")

    generator = torch.Generator("cuda").manual_seed(seed) if seed else None

    image = pipe(
        prompt=prompt,
        height=height,
        width=width,
        guidance_scale=1.0,
        num_inference_steps=steps,
        generator=generator,
    ).images[0]

    # Unload
    del pipe
    import gc
    gc.collect()
    torch.cuda.empty_cache()

    elapsed = time.time() - start
    return image, elapsed, "FLUX.2-klein-4B"


def generate_sd35(prompt, width, height, seed=None, steps=28):
    """Generate image with Stable Diffusion 3.5 Medium locally."""
    import torch
    from diffusers import StableDiffusion3Pipeline

    if not ensure_vram(6000):
        sys.exit(1)

    start = time.time()

    pipe = StableDiffusion3Pipeline.from_pretrained(
        "stabilityai/stable-diffusion-3.5-medium",
        torch_dtype=torch.float16,
    ).to("cuda")

    generator = torch.Generator("cuda").manual_seed(seed) if seed else None

    image = pipe(
        prompt=prompt,
        height=height,
        width=width,
        num_inference_steps=steps,
        generator=generator,
    ).images[0]

    del pipe
    import gc
    gc.collect()
    torch.cuda.empty_cache()

    elapsed = time.time() - start
    return image, elapsed, "SD-3.5-Medium"


def generate_openai(prompt, width, height, transparent=False, quality="mini"):
    """Generate image with OpenAI GPT Image 1 API."""
    from openai import OpenAI

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print(json.dumps({"error": "OPENAI_API_KEY environment variable not set"}))
        sys.exit(1)

    start = time.time()
    client = OpenAI()

    # Map dimensions to API sizes
    if width > height:
        size = "1536x1024"
    elif height > width:
        size = "1024x1536"
    else:
        size = "1024x1024"

    # Map quality to model
    model = "gpt-image-1"

    kwargs = {
        "model": model,
        "prompt": prompt,
        "size": size,
        "quality": "high" if quality == "high" else "medium" if quality == "medium" else "low",
        "n": 1,
    }

    if transparent:
        kwargs["background"] = "transparent"
        kwargs["output_format"] = "png"

    result = client.images.generate(**kwargs)

    # Download image
    import base64
    image_data = base64.b64decode(result.data[0].b64_json)

    elapsed = time.time() - start

    # Cost estimate
    costs = {"mini": 0.005, "medium": 0.034, "high": 0.20}
    cost = costs.get(quality, 0.005)

    return image_data, elapsed, f"GPT-Image-1-{quality}", cost


def generate_gemini(prompt, width, height, resolution="2K", aspect_ratio=None):
    """Generate image with Gemini 3 Pro Image (Nano Banana Pro) API."""
    from google import genai
    from google.genai import types

    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        print(json.dumps({"error": "GOOGLE_API_KEY environment variable not set"}))
        sys.exit(1)

    start = time.time()
    client = genai.Client(api_key=api_key)

    # Determine aspect ratio from dimensions if not specified
    if not aspect_ratio:
        ratio = width / height
        if abs(ratio - 16/9) < 0.1:
            aspect_ratio = "16:9"
        elif abs(ratio - 9/16) < 0.1:
            aspect_ratio = "9:16"
        elif abs(ratio - 4/3) < 0.1:
            aspect_ratio = "4:3"
        elif abs(ratio - 3/4) < 0.1:
            aspect_ratio = "3:4"
        elif abs(ratio - 4/5) < 0.1:
            aspect_ratio = "4:5"
        elif abs(ratio - 5/4) < 0.1:
            aspect_ratio = "5:4"
        elif abs(ratio - 21/9) < 0.1:
            aspect_ratio = "21:9"
        else:
            aspect_ratio = "1:1"

    # Validate resolution
    resolution = resolution.upper()
    if resolution not in ("1K", "2K", "4K"):
        resolution = "2K"

    response = client.models.generate_content(
        model="gemini-3-pro-image-preview",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_modalities=["TEXT", "IMAGE"],
            image_resolution=resolution,
        ),
    )

    # Extract image from response
    image_data = None
    for part in response.candidates[0].content.parts:
        if hasattr(part, "inline_data") and part.inline_data is not None:
            image_data = part.inline_data.data
            break

    if image_data is None:
        print(json.dumps({"error": "No image generated by Gemini — prompt may have been blocked"}))
        sys.exit(1)

    elapsed = time.time() - start

    # Cost estimate based on resolution
    costs = {"1K": 0.134, "2K": 0.134, "4K": 0.24}
    cost = costs.get(resolution, 0.134)

    return image_data, elapsed, f"gemini-3-pro-image-{resolution}", cost


def remove_background(input_path, output_path, model="u2net_human_seg"):
    """Remove background from image using rembg."""
    start = time.time()

    subprocess.run(
        ["rembg", "i", "-m", model, input_path, output_path],
        check=True, capture_output=True
    )

    elapsed = time.time() - start
    return elapsed


def remove_background_batch(input_dir, output_dir, model="u2net_human_seg"):
    """Remove background from all images in a directory."""
    os.makedirs(output_dir, exist_ok=True)
    start = time.time()

    subprocess.run(
        ["rembg", "p", "-m", model, input_dir, output_dir],
        check=True, capture_output=True
    )

    elapsed = time.time() - start
    files = list(Path(output_dir).glob("*"))
    return elapsed, len(files)


def main():
    parser = argparse.ArgumentParser(description="AI image generation for video production")
    parser.add_argument("--prompt", help="Text prompt for image generation")
    parser.add_argument("--width", type=int, default=1024, help="Output width (default: 1024)")
    parser.add_argument("--height", type=int, default=576, help="Output height (default: 576)")
    parser.add_argument("--model", default="flux", choices=["flux", "sd35medium"],
                        help="Local model (default: flux)")
    parser.add_argument("--api", choices=["gemini", "openai"],
                        help="Use API instead of local model (gemini = Nano Banana Pro, openai = GPT Image 1)")
    parser.add_argument("--transparent", action="store_true", help="Transparent background (API only)")
    parser.add_argument("--quality", default="mini", choices=["mini", "medium", "high"],
                        help="API quality tier (default: mini)")
    parser.add_argument("--quantize", choices=["int8"], help="Quantization for local models")
    parser.add_argument("--seed", type=int, help="Random seed for reproducibility")
    parser.add_argument("--steps", type=int, help="Inference steps")
    parser.add_argument("--batch", type=int, default=1, help="Number of images to generate")
    parser.add_argument("--output", required=True, help="Output file path")
    parser.add_argument("--remove-bg", help="Remove background from input image")
    parser.add_argument("--remove-bg-dir", help="Remove background from all images in directory")
    parser.add_argument("--output-dir", help="Output directory for batch operations")
    parser.add_argument("--resolution", default="2K", choices=["1K", "2K", "4K"],
                        help="Gemini image resolution (default: 2K)")
    parser.add_argument("--aspect", help="Aspect ratio for Gemini (e.g., 16:9, 9:16, 1:1)")
    parser.add_argument("--bg-model", default="u2net_human_seg",
                        help="rembg model (default: u2net_human_seg)")

    args = parser.parse_args()

    # Background removal mode
    if args.remove_bg:
        elapsed = remove_background(args.remove_bg, args.output, args.bg_model)
        print(json.dumps({
            "action": "remove_background",
            "input": args.remove_bg,
            "output": args.output,
            "model": args.bg_model,
            "processing_time_sec": round(elapsed, 2)
        }, indent=2))
        return

    if args.remove_bg_dir:
        if not args.output_dir:
            print(json.dumps({"error": "--output-dir required for batch background removal"}))
            sys.exit(1)
        elapsed, count = remove_background_batch(args.remove_bg_dir, args.output_dir, args.bg_model)
        print(json.dumps({
            "action": "remove_background_batch",
            "input_dir": args.remove_bg_dir,
            "output_dir": args.output_dir,
            "files_processed": count,
            "processing_time_sec": round(elapsed, 2)
        }, indent=2))
        return

    # Generation mode
    if not args.prompt:
        print(json.dumps({"error": "--prompt required for image generation"}))
        sys.exit(1)

    if args.api == "gemini":
        image_data, elapsed, model_name, cost = generate_gemini(
            args.prompt, args.width, args.height,
            args.resolution, args.aspect
        )
        with open(args.output, "wb") as f:
            f.write(image_data)

        print(json.dumps({
            "action": "generate",
            "provider": "gemini_api",
            "model": model_name,
            "prompt": args.prompt,
            "resolution": args.resolution,
            "output": args.output,
            "generation_time_sec": round(elapsed, 2),
            "cost_usd": cost
        }, indent=2))

    elif args.api == "openai":
        image_data, elapsed, model_name, cost = generate_openai(
            args.prompt, args.width, args.height,
            args.transparent, args.quality
        )
        with open(args.output, "wb") as f:
            f.write(image_data)

        print(json.dumps({
            "action": "generate",
            "provider": "openai_api",
            "model": model_name,
            "prompt": args.prompt,
            "width": args.width,
            "height": args.height,
            "transparent": args.transparent,
            "output": args.output,
            "generation_time_sec": round(elapsed, 2),
            "cost_usd": cost
        }, indent=2))

    elif args.model == "sd35medium":
        steps = args.steps or 28
        image, elapsed, model_name = generate_sd35(
            args.prompt, args.width, args.height, args.seed, steps
        )
        image.save(args.output)
        print(json.dumps({
            "action": "generate",
            "provider": "local",
            "model": model_name,
            "prompt": args.prompt,
            "width": args.width,
            "height": args.height,
            "output": args.output,
            "generation_time_sec": round(elapsed, 2),
            "vram_used_mb": 6000,
            "cost_usd": 0
        }, indent=2))

    else:  # flux (default)
        steps = args.steps or 4
        image, elapsed, model_name = generate_flux(
            args.prompt, args.width, args.height, args.quantize, args.seed, steps
        )
        image.save(args.output)
        print(json.dumps({
            "action": "generate",
            "provider": "local",
            "model": model_name,
            "prompt": args.prompt,
            "width": args.width,
            "height": args.height,
            "output": args.output,
            "generation_time_sec": round(elapsed, 2),
            "vram_used_mb": 7000 if args.quantize else 13000,
            "cost_usd": 0
        }, indent=2))


if __name__ == "__main__":
    main()
