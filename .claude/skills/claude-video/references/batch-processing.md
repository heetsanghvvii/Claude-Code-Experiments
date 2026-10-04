# Batch Processing Reference

## GNU Parallel with FFmpeg NVENC

### Consumer GPU Session Limits
RTX 5070 Ti supports up to 8 concurrent NVENC sessions, but practically limit to 2-3 for stable performance.

### Basic Batch Transcode
```bash
# 2 concurrent GPU encodes
find ./input -name "*.mov" -print0 | xargs -0 -n1 -P2 \
  ffmpeg -n -hwaccel cuda -hwaccel_output_format cuda -i {} \
  -c:v hevc_nvenc -preset p5 -cq 23 -c:a aac -movflags +faststart ./output/{}.mp4
```

### GNU Parallel (Preferred)
```bash
# Install
sudo apt install parallel

# Batch transcode with 2 concurrent jobs
find ./input -name "*.mkv" | parallel -j 2 \
  "ffmpeg -n -hwaccel cuda -i {} -c:v h264_nvenc -preset p5 -cq 23 \
   -c:a aac -movflags +faststart ./output/{/.}.mp4"
```

### Parallel Options
| Flag | Purpose | Example |
|------|---------|---------|
| `-j N` | Max concurrent jobs | `-j 2` (for NVENC) |
| `--progress` | Show progress bar | `--progress` |
| `--halt soon,fail=1` | Stop on first failure | Error handling |
| `--results DIR` | Save stdout/stderr per job | `--results ./logs/` |
| `--resume` | Skip completed jobs | For restartable batches |
| `{/.}` | Input filename without extension | Naming outputs |
| `{/}` | Input filename with extension | Preserving names |

### Auto-Detect GPU Encoder
```bash
ENCODER=$(ffmpeg -encoders 2>/dev/null | grep -q h264_nvenc \
  && echo "h264_nvenc -preset p5 -cq 23" \
  || echo "libx264 -crf 23 -preset medium")

find ./input -name "*.mkv" | parallel -j 3 \
  "ffmpeg -n -i {} -c:v $ENCODER -c:a aac -movflags +faststart ./output/{/.}.mp4"
```

## Batch AI Enhancement

### Batch Upscale
```bash
# Process videos one at a time (GPU intensive)
for f in ./input/*.mp4; do
    base=$(basename "$f" .mp4)
    python3 scripts/video_enhance.py upscale "$f" --scale 2 --output "./output/${base}_2x.mp4"
done
```

### Batch Background Removal
```bash
# rembg supports directory batch natively
rembg p ./frames/ ./transparent/ -m u2net_human_seg
```

### Batch Image Generation
```bash
# Generate from a prompts file (one per line)
while IFS= read -r prompt; do
    idx=$((${idx:-0} + 1))
    python3 scripts/image_generate.py --prompt "$prompt" \
      --width 1920 --height 1080 --output "./images/img_$(printf '%03d' $idx).png"
done < prompts.txt
```

## Batch Export for Multiple Platforms
```bash
# Export same video for all platforms
for platform in youtube tiktok instagram linkedin; do
    # Uses export sub-skill preset logic
    ffmpeg -n -i input.mp4 \
      $(python3 -c "
platforms = {
    'youtube': '-vf scale=1920:1080 -c:v libx264 -crf 18 -preset slow',
    'tiktok': '-vf scale=1080:1920 -c:v libx264 -crf 20',
    'instagram': '-vf scale=1080:1080 -c:v libx264 -crf 20',
    'linkedin': '-vf scale=1920:1080 -c:v libx264 -crf 20'
}
print(platforms['$platform'])
      ") \
      -c:a aac -b:a 192k -movflags +faststart \
      "output_${platform}.mp4"
done
```

## Progress Tracking

### With GNU Parallel
```bash
find . -name "*.mp4" | parallel --progress -j 2 \
  "ffmpeg -n -i {} -c:v h264_nvenc -cq 23 ./output/{/.}.mp4 2>/dev/null"
```

### Custom Progress Script
```bash
#!/bin/bash
files=(./input/*.mp4)
total=${#files[@]}
done=0

for f in "${files[@]}"; do
    done=$((done + 1))
    echo "[$done/$total] Processing: $(basename "$f")"
    ffmpeg -n -i "$f" -c:v h264_nvenc -cq 23 "./output/$(basename "${f%.mp4}").mp4" 2>/dev/null
done
echo "Complete: $done/$total files processed"
```

## Error Handling

### Continue on Failure
```bash
find . -name "*.mp4" | parallel -j 2 --halt never \
  "ffmpeg -n -i {} -c:v h264_nvenc -cq 23 ./output/{/.}.mp4 2>./logs/{/.}.log"

# Check for failures
grep -l "Error" ./logs/*.log
```

### Retry Failed Jobs
```bash
# GNU parallel with joblog for retry
find . -name "*.mp4" | parallel --joblog batch.log -j 2 \
  "ffmpeg -n -i {} -c:v h264_nvenc -cq 23 ./output/{/.}.mp4"

# Retry only failed jobs
parallel --retry-failed --joblog batch.log
```

## Disk Space Management

```bash
# Estimate total output size before starting
total_mb=0
for f in ./input/*.mp4; do
    size=$(bash scripts/estimate_size.sh "$f" | python3 -c "import json,sys; print(json.load(sys.stdin)['estimated_output_mb'])")
    total_mb=$((total_mb + size))
done
echo "Estimated total output: ${total_mb}MB"

available=$(df -m ./output | awk 'NR==2 {print $4}')
echo "Available space: ${available}MB"

if [ "$total_mb" -gt "$available" ]; then
    echo "WARNING: Insufficient disk space!"
fi
```

## NVENC Concurrent Session Guide

| GPU | Max Sessions | Recommended |
|-----|-------------|-------------|
| RTX 5070 Ti | 8 | 2-3 |
| RTX 4070 Ti | 8 | 2-3 |
| RTX 3070 | 5 | 2 |

Higher session counts reduce per-session quality and speed. Stick to 2-3 for best results.
