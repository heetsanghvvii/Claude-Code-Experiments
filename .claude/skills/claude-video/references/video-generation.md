# Video Generation Reference

## Google Veo 3.1 (Primary)

### Setup
```bash
pip install google-genai
export GEMINI_API_KEY="your-key-here"
```

### Pricing
| Tier | Cost/sec | Gen Time | Max Duration | Resolution |
|------|----------|----------|-------------|-----------|
| Fast | $0.15 | 2-5 min | 8s | Up to 4K |
| Standard | $0.40 | 5-12 min | 8s | Up to 4K |

**Per-clip cost**: 8s x $0.15 = **$1.20** (Fast), 8s x $0.40 = **$3.20** (Standard)

### Text-to-Video
```python
from google import genai
from google.genai import types

client = genai.Client()
operation = client.models.generate_videos(
    model="veo-3.1-generate-preview",
    prompt="A drone shot over a misty forest at sunrise, cinematic",
    config=types.GenerateVideosConfig(
        aspect_ratio="16:9",
        resolution="1080p"
    ),
)

# Poll until complete
import time
while not operation.done:
    time.sleep(10)
    operation = client.operations.get(operation)

video = operation.response.generated_videos[0]
video.video.save("output.mp4")
```

### Image-to-Video
```python
from PIL import Image
image = types.Image(image_bytes=open("reference.png", "rb").read())
operation = client.models.generate_videos(
    model="veo-3.1-generate-preview",
    prompt="Camera slowly zooms in, gentle wind movement",
    image=image,
    config=types.GenerateVideosConfig(aspect_ratio="16:9", resolution="1080p"),
)
```

### Video Extension
Chain up to 20 extensions for ~148 seconds total. Each extension adds ~8s and costs $1.20 (Fast).

### Key Features
- Native synchronized audio (dialogue, SFX, ambient)
- Text-to-video and image-to-video
- Up to 4K resolution
- 16:9, 9:16, 1:1 aspect ratios

## Runway Gen-4 Turbo (Budget B-Roll)

### Setup
```bash
pip install runwayml
export RUNWAY_API_KEY="your-key-here"
```

### Pricing
- $0.05/sec x 10s = **$0.50/clip** (5x cheaper than Veo for silent B-roll)

### Capabilities
- Text-to-video and image-to-video
- Max 10 seconds
- Up to 1080p
- 30-60 second generation time
- **No audio output** (silent video)

### Best For
- Placeholder B-roll footage
- Background videos
- Transitions
- Any clip where you'll add your own audio

## Local SVD-XT (Free, Limited)

### Requirements
- 16GB VRAM (exclusive use)
- Image input required (no text-to-video)

### Capabilities
- 2-4 second clips
- 1024x576 resolution
- 2-25 minute generation time
- No audio

```python
from diffusers import StableVideoDiffusionPipeline
from diffusers.utils import load_image, export_to_video
import torch

pipe = StableVideoDiffusionPipeline.from_pretrained(
    "stabilityai/stable-video-diffusion-img2vid-xt",
    torch_dtype=torch.float16, variant="fp16"
).to("cuda")

image = load_image("source.png").resize((1024, 576))
frames = pipe(image, decode_chunk_size=8, num_frames=25).frames[0]
export_to_video(frames, "output.mp4", fps=7)
```

### Best For
- Subtle motion effects from stills
- When no API keys available
- Testing/prototyping

## Emerging Models (Watch List)

| Model | Status | Notable |
|-------|--------|---------|
| Wan2.2 (Alibaba) | Open source | Competitive quality |
| HunyuanVideo 1.5 (Tencent) | Open source | Text-to-video |
| Open-Sora 2.0 | Open source | Community effort |
| Kling 2.6 (Kuaishou) | API | Up to 3 min clips |

## Cost Planning

**Monthly budget for typical production (20 shorts/month):**
| Item | Usage | Cost |
|------|-------|------|
| Veo 3.1 Fast B-roll | 40 x 8s clips | $48 |
| Runway fallback | 20 x 10s clips | $10 |
| Total video gen | ~60 clips | **~$58** |

## Polling Pattern

```python
def poll_with_progress(operation, client, timeout=900, interval=10):
    """Poll API operation with progress updates."""
    start = time.time()
    while not operation.done:
        elapsed = time.time() - start
        if elapsed > timeout:
            raise TimeoutError(f"Generation timed out after {timeout}s")
        time.sleep(interval)
        operation = client.operations.get(operation)
        print(f"  Generating... ({elapsed:.0f}s elapsed)", file=sys.stderr)
    return operation
```

## Fallback Chain

```
1. Veo 3.1 Fast ($1.20/clip) → Best quality, native audio
2. Runway Gen-4 Turbo ($0.50/clip) → Budget silent B-roll
3. Local SVD-XT (free) → Image-to-video only, 2-4s, degraded
4. Remotion (free) → Programmatic motion graphics (existing create sub-skill)
```
