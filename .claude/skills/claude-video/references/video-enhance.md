# Video Enhancement Reference

## Real-ESRGAN — AI Upscaling

### Models
| Model | Scale | Best For | VRAM (FP16) |
|-------|-------|----------|-------------|
| RealESRGAN_x4plus | 4x | General video/photo | 2-6GB |
| RealESRGAN_x4plus_anime | 4x | Anime/cartoon | 2-6GB |
| RealESRGAN_x2plus | 2x | General (moderate upscale) | 2-4GB |

### CLI Usage
```bash
# Upscale single image
python3 -m realesrgan -n RealESRGAN_x4plus -i input.png -o output.png --half

# Upscale directory of frames
python3 -m realesrgan -n RealESRGAN_x4plus -i frames/ -o upscaled/ --outscale 4 --half
```

### Full Video Pipeline
```bash
# 1. Extract frames
ffmpeg -i input_720p.mp4 -qscale:v 1 -qmin 1 frames/frame_%08d.png

# 2. Extract audio
ffmpeg -i input_720p.mp4 -vn -c:a copy audio.aac

# 3. Upscale all frames (GPU)
python3 -m realesrgan -n RealESRGAN_x4plus -i frames/ -o upscaled/ --outscale 4 --half

# 4. Reassemble video
ffmpeg -framerate 30 -i upscaled/frame_%08d_out.png -i audio.aac \
  -c:v hevc_nvenc -preset p5 -cq 20 -pix_fmt yuv420p -c:a copy output_4k.mp4
```

### Performance
| Input | Scale | FPS (FP16) | 10min Video |
|-------|-------|-----------|-------------|
| 480p | 4x | 5-8 | 30-60 min |
| 720p | 4x | 2-5 | 1-2.5 hours |
| 1080p | 2x | 1-3 | 1.5-3 hours |

### Disk Space
Intermediate PNG frames require significant storage:
- 720p frame: ~2-3MB each
- 4K frame: ~10-20MB each
- 10min 30fps video = 18,000 frames
- 4K temp space: 180-360GB

## Practical-RIFE — Frame Interpolation

### Installation
```bash
git clone https://github.com/hzwer/Practical-RIFE.git ~/.video-skill/rife
```

### Usage
```bash
cd ~/.video-skill/rife
python3 inference_video.py --multi=2 --video=input.mp4
# Output: input_2X.mp4 (in same directory)

python3 inference_video.py --multi=4 --video=input.mp4
# Output: input_4X.mp4
```

### Multipliers
| Multi | Effect | FPS Change | Speed |
|-------|--------|-----------|-------|
| 2x | Smooth playback OR 2x slow motion | 30→60fps | 60+ FPS at 720p |
| 4x | 4x slow motion | 30→120fps | ~30 FPS at 720p |
| 8x | Extreme slow motion | 30→240fps | ~15 FPS at 720p |

### VRAM: 2-4GB

### Use Cases
- Convert 30fps to 60fps for smoother export
- Create cinematic slow motion from normal footage
- Smooth choppy screen recordings

## CodeFormer — Face Restoration

### Installation
```bash
git clone https://github.com/sczhou/CodeFormer.git ~/.video-skill/codeformer
cd ~/.video-skill/codeformer
pip install -r requirements.txt
python basicsr/setup.py develop
```

### Usage
```bash
python3 inference_codeformer.py \
  -w 0.7 \
  --input_path frames/ \
  --output_path restored/ \
  --bg_upsampler realesrgan \
  --face_upsample
```

### Fidelity Parameter (-w)
| Value | Effect | Best For |
|-------|--------|----------|
| 0.0 | Most beautiful (hallucinated) | Artistic enhancement |
| 0.3 | Strong enhancement | Very degraded faces |
| 0.5 | Balanced | General restoration |
| 0.7 | **Recommended** | Natural-looking restoration |
| 1.0 | Most faithful (minimal change) | Subtle cleanup |

### VRAM: 2-4GB (CodeFormer) + 2-4GB (bg_upsampler)

### Alternative: GFPGAN v1.3
```bash
pip install gfpgan
python3 inference_gfpgan.py -i frames/ -o restored/ -v 1.3 --bg_upsampler realesrgan
```
Simpler but less control than CodeFormer. Use when CodeFormer is unavailable.

## rembg — Background Removal for Video

### Single Frame
```bash
rembg i input.png output_transparent.png
```

### Batch (Video Frames)
```bash
rembg p input_frames/ output_frames/ -m u2net_human_seg
```

### Video Output Formats with Alpha

**VP9 + Alpha (WebM, for web):**
```bash
ffmpeg -framerate 30 -i transparent_frames/%08d.png \
  -c:v libvpx-vp9 -pix_fmt yuva420p -crf 20 -b:v 0 output.webm
```

**ProRes 4444 (MOV, for editing):**
```bash
ffmpeg -framerate 30 -i transparent_frames/%08d.png \
  -c:v prores_ks -profile:v 4 -pix_fmt yuva444p10le output.mov
```

### Models
| Model | Best For | Speed |
|-------|----------|-------|
| u2net_human_seg | People/humans | Fast |
| u2net | General objects | Fast |
| isnet-general-use | General (alternative) | Fast |

### Performance: 5-10 FPS for 1080p with GPU

## SAM 2.1 — Video Object Tracking

For isolating specific subjects (not just background removal):

```python
from sam2.build_sam import build_sam2_video_predictor

predictor = build_sam2_video_predictor("sam2.1_hiera_large")
state = predictor.init_state(video_path="video.mp4")

# Prompt on first frame (click point or bounding box)
predictor.add_new_points_or_box(state, frame_idx=0, obj_id=1, points=[[500, 300]])

# Propagate through entire video
for frame_idx, obj_ids, masks in predictor.propagate_in_video(state):
    # masks[0] is the binary mask for the tracked object
    pass
```

VRAM: 4-16GB depending on model size. Best for isolating specific objects across a whole video.

## Time Estimation Formulas

```python
def estimate_upscale_time(frames, input_height, scale, half=True):
    """Estimate upscaling time in seconds."""
    fps_map = {
        (480, 4): 7.0, (720, 4): 3.5, (1080, 2): 2.0,
        (720, 2): 6.0, (1080, 4): 1.5
    }
    fps = fps_map.get((input_height, scale), 2.0)
    if not half:
        fps *= 0.6
    return frames / fps

def estimate_temp_space_gb(frames, output_width, output_height):
    """Estimate temp space for PNG frames in GB."""
    bytes_per_frame = output_width * output_height * 3 * 1.5  # ~1.5x for PNG compression
    return frames * bytes_per_frame / 1024**3
```

## VRAM Summary

| Tool | VRAM | Tier |
|------|------|------|
| Real-ESRGAN (FP16) | 2-6GB | Light-Medium |
| Practical-RIFE | 2-4GB | Light |
| CodeFormer | 2-4GB | Light |
| rembg GPU | 1-2GB | Light |
| SAM 2.1 Large | 8-16GB | Heavy |

Multiple light models can coexist if combined VRAM < 12GB.
