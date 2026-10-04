# Image Generation Reference

## FLUX.2 klein 4B (Local — Primary)

- **License**: Apache 2.0 (commercial-friendly)
- **VRAM**: 13GB (BF16), ~8GB (INT8 quantized)
- **Speed**: <1 second per 1024x576 image (4 steps)
- **Quality**: Top-tier

```python
import torch
from diffusers import FluxPipeline

pipe = FluxPipeline.from_pretrained(
    "black-forest-labs/FLUX.2-klein-4B",
    torch_dtype=torch.bfloat16
).to("cuda")

image = pipe(
    prompt="Cinematic wide shot of mountains at sunset, 16:9",
    height=576, width=1024,
    guidance_scale=0.0, num_inference_steps=4,
).images[0]
image.save("output.png")
```

**Quantized (INT8, ~8GB VRAM):**
```python
from transformers import BitsAndBytesConfig
pipe = FluxPipeline.from_pretrained(
    "black-forest-labs/FLUX.2-klein-4B",
    quantization_config=BitsAndBytesConfig(load_in_8bit=True),
    torch_dtype=torch.bfloat16
)
```

## Stable Diffusion 3.5 Medium (Local — Fallback)

- **License**: Community (free under $1M revenue)
- **VRAM**: 6GB (FP16)
- **Speed**: ~5-20 seconds
- **Quality**: Very good

```python
from diffusers import StableDiffusion3Pipeline
pipe = StableDiffusion3Pipeline.from_pretrained(
    "stabilityai/stable-diffusion-3.5-medium",
    torch_dtype=torch.float16
).to("cuda")

image = pipe("Professional headshot, studio lighting", num_inference_steps=28).images[0]
```

## OpenAI GPT Image 1 (API — For Transparent PNGs)

- **Pricing**: $0.005 (mini), $0.034 (medium), $0.20 (high quality)
- **Transparent background**: Native support
- **Sizes**: 1024x1024, 1536x1024, 1024x1536

```python
from openai import OpenAI
import base64

client = OpenAI()
result = client.images.generate(
    model="gpt-image-1",
    prompt="Professional podcast microphone on transparent background",
    size="1024x1024",
    background="transparent",
    output_format="png",
    quality="low",  # mini tier
    n=1
)
image_data = base64.b64decode(result.data[0].b64_json)
with open("overlay.png", "wb") as f:
    f.write(image_data)
```

## Gemini 3 Pro Image / Nano Banana Pro (API — Primary)

- **Model ID**: `gemini-3-pro-image-preview`
- **Pricing**: $0.13 (1K/2K), $0.24 (4K) per image
- **Resolutions**: 1K, 2K, 4K
- **Aspect ratios**: 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9
- **Features**: Google Search integration, multi-turn editing, factual accuracy
- **No transparent background support** (use OpenAI for that)

```python
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GOOGLE_API_KEY"])
response = client.models.generate_content(
    model="gemini-3-pro-image-preview",
    contents="Professional SEO dashboard showing metrics and charts",
    config=types.GenerateContentConfig(
        response_modalities=["TEXT", "IMAGE"],
        image_resolution="2K",
    ),
)

# Extract image from multimodal response
for part in response.candidates[0].content.parts:
    if hasattr(part, "inline_data") and part.inline_data is not None:
        with open("output.png", "wb") as f:
            f.write(part.inline_data.data)
        break
```

**Also available:** Gemini 2.5 Flash Image (`gemini-2.5-flash-image`) — cheaper at $0.039/image but lower quality.

## Background Removal (rembg)

- **VRAM**: 1-2GB (GPU), CPU fallback available
- **Speed**: 5-10 FPS for 1080p
- **License**: MIT

```bash
# Single image
rembg i input.png output_transparent.png

# Batch directory
rembg p input_dir/ output_dir/ -m u2net_human_seg

# Models:
# u2net_human_seg — optimized for humans (recommended for video)
# u2net — general purpose
# isnet-general-use — alternative general model
```

**Combine with FLUX for free transparent images:**
```bash
# 1. Generate with FLUX (no alpha)
python3 scripts/image_generate.py --prompt "Icon on white bg" --output raw.png
# 2. Remove background
rembg i raw.png transparent.png
```

## Video-Native Dimensions

| Use Case | Width | Height | Aspect | FLUX Size |
|----------|-------|--------|--------|-----------|
| YouTube/LinkedIn 16:9 | 1920 | 1080 | 16:9 | 1024x576 |
| TikTok/Shorts 9:16 | 1080 | 1920 | 9:16 | 576x1024 |
| Instagram Square 1:1 | 1080 | 1080 | 1:1 | 1024x1024 |
| Instagram Portrait 4:5 | 1080 | 1350 | 4:5 | 768x960 |
| 4K Landscape | 3840 | 2160 | 16:9 | 1024x576 (upscale) |

Generate at FLUX native size, then upscale with FFmpeg:
```bash
ffmpeg -n -i generated_1024.png -vf "scale=1920:1080:flags=lanczos" output_1080p.png
```

## Transparent Video Output

For overlaying generated images on video:
```bash
# VP9 with alpha (WebM for web)
ffmpeg -i frames/%04d.png -c:v libvpx-vp9 -pix_fmt yuva420p -crf 20 overlay.webm

# ProRes 4444 with alpha (for editing)
ffmpeg -i frames/%04d.png -c:v prores_ks -profile:v 4 -pix_fmt yuva444p10le overlay.mov
```

## Fallback Chain

```
1. Gemini 3 Pro Image ($0.13, ~3s, 4K) → Best quality, complex prompts, factual content
2. FLUX.2 klein local (free, <1s, 13GB) → Best if VRAM available and no API needed
3. SD 3.5 Medium local (free, ~10s, 6GB) → When <13GB VRAM free
4. OpenAI GPT Image 1 Mini ($0.005, ~2s) → When need transparent PNG background
```
