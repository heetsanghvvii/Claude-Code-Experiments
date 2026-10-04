# GPU Acceleration Reference

## RTX 5070 Ti Capabilities

| Feature | Support |
|---------|---------|
| Architecture | Blackwell |
| VRAM | 16 GB GDDR7 |
| NVENC H.264 | Yes |
| NVENC H.265/HEVC | Yes |
| NVENC AV1 | Yes |
| NVDEC (hardware decode) | Yes |
| CUDA filters | Yes |
| Max concurrent NVENC sessions | 8 |
| Driver | 580.119.02 (open kernel modules) |
| CUDA Version | 13.0 |

## Detection Script

```
bash scripts/detect_gpu.sh
```
Returns JSON: gpu_name, driver, nvenc_available, encoders[], cuda_filters[].

## NVENC Encoding Commands

### H.264 NVENC (fastest, widest compatibility)
```
ffmpeg -n -hwaccel cuda -hwaccel_output_format cuda -i INPUT \
  -c:v h264_nvenc -preset p5 -tune hq -rc constqp -cq 23 \
  -spatial-aq 1 -temporal-aq 1 -rc-lookahead 32 \
  -c:a aac -b:a 192k OUTPUT
```

### H.265 NVENC (better compression)
```
ffmpeg -n -hwaccel cuda -hwaccel_output_format cuda -i INPUT \
  -c:v hevc_nvenc -preset p5 -tune hq -rc constqp -cq 28 \
  -spatial-aq 1 -temporal-aq 1 -rc-lookahead 32 \
  -tag:v hvc1 -c:a aac -b:a 192k OUTPUT
```

### AV1 NVENC (best compression, RTX 40/50 series)
```
ffmpeg -n -hwaccel cuda -hwaccel_output_format cuda -i INPUT \
  -c:v av1_nvenc -preset p5 -tune hq -rc constqp -cq 30 \
  -c:a aac -b:a 192k OUTPUT
```

## NVENC Presets

| Preset | Speed | Quality | Use Case |
|--------|-------|---------|----------|
| p1 | Fastest | Lowest | Previews, drafts |
| p2 | Very fast | Low | Quick tests |
| p3 | Fast | Good | Quick exports |
| p4 | Medium | Very good | General use |
| **p5** | **Balanced** | **Very good** | **Recommended default** |
| p6 | Slow | Excellent | Quality priority |
| p7 | Slowest | Best | Final delivery |

## NVENC Quality Flags

| Flag | Purpose | Recommended |
|------|---------|-------------|
| `-rc constqp -cq N` | Constant quality (like CRF) | Always use |
| `-spatial-aq 1` | Spatial adaptive quantization | Always enable |
| `-temporal-aq 1` | Temporal adaptive quantization | Always enable |
| `-rc-lookahead 32` | Lookahead frames for better decisions | Always set |
| `-tune hq` | High quality tuning | Always set |
| `-b_ref_mode 2` | B-frame reference mode | For H.264 |
| `-multipass fullres` | Multi-pass encoding | For best quality |

## GPU-Accelerated Decode + Scale + Encode Pipeline

Full GPU pipeline (no CPU roundtrip):
```
ffmpeg -hwaccel cuda -hwaccel_output_format cuda -i INPUT \
  -vf "scale_cuda=1280:720" -c:v h264_nvenc -preset p5 OUTPUT
```

## CUDA Filters

| Filter | Syntax |
|--------|--------|
| Scale | `scale_cuda=W:H` |
| Overlay | Requires hwdownload first |
| Transpose | `transpose_cuda=1` |
| Thumbnail | `thumbnail_cuda` |

Note: Most filters require CPU memory. Use `hwdownload,format=nv12` to move frames to CPU for complex filtergraphs, then NVENC encodes the output.

## Fallback Pattern

```
# Try GPU, fall back to CPU if CUDA fails
ffmpeg -n -hwaccel cuda -hwaccel_output_format cuda -i INPUT \
  -c:v h264_nvenc -preset p5 -tune hq -rc constqp -cq 23 \
  -c:a aac OUTPUT 2>/dev/null || \
ffmpeg -n -i INPUT \
  -c:v libx264 -crf 23 -preset medium \
  -c:a aac OUTPUT
```

## Parallel Batch Encoding

NVENC supports up to 8 concurrent sessions:
```
find ./input -name "*.mkv" | parallel -j 3 \
  "ffmpeg -n -hwaccel cuda -i {} -c:v h264_nvenc -preset p5 -cq 23 \
   -c:a aac -movflags +faststart ./output/{/.}.mp4"
```

Limit to 3 concurrent jobs to leave headroom for system GPU usage.

## Performance Expectations

| Operation | NVENC Speed | CPU Speed |
|-----------|------------|-----------|
| H.264 1080p encode | 10-15x realtime | 0.5-2x realtime |
| H.265 1080p encode | 8-12x realtime | 0.3-1x realtime |
| AV1 1080p encode | 5-10x realtime | 0.1-0.3x realtime |
| 4K encode | 3-5x realtime | 0.1-0.5x realtime |
