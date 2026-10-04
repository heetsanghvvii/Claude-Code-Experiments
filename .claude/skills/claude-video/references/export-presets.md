# Platform Export Presets

## Platform Specifications

| Platform | Max Resolution | Max Duration | Max Size | Aspect Ratio | Codec |
|----------|---------------|-------------|----------|-------------|-------|
| YouTube | 8K | 12 hours | 256 GB | Any (16:9 preferred) | H.264/H.265/AV1 |
| TikTok | 1080x1920 | 10 min | 287 MB | 9:16 | H.264 |
| Instagram Reels | 1080x1920 | 3 min | 250 MB | 9:16 | H.264 |
| Instagram Feed | 1080x1080 | 60s | 250 MB | 1:1 or 4:5 | H.264 |
| LinkedIn | 1920x1080 | 10 min | 200 MB | 16:9 or 1:1 | H.264 |
| Twitter/X | 1920x1200 | 2:20 | 512 MB | Any | H.264 |
| Web (WebM) | Any | Any | Any | Any | VP9/AV1 + Opus |

## Ready-to-Use Commands

### YouTube 1080p
```
ffmpeg -n -i INPUT -c:v libx264 -preset slow -crf 18 -profile:v high -level 4.1 \
  -pix_fmt yuv420p -bf 2 -g 30 -movflags +faststart \
  -c:a aac -b:a 384k -ar 48000 OUTPUT_youtube.mp4
```

### YouTube NVENC
```
ffmpeg -n -hwaccel cuda -hwaccel_output_format cuda -i INPUT \
  -c:v h264_nvenc -preset p5 -tune hq -rc constqp -cq 19 \
  -profile:v high -movflags +faststart \
  -c:a aac -b:a 384k -ar 48000 OUTPUT_youtube.mp4
```

### TikTok/Reels (center crop)
```
ffmpeg -n -i INPUT \
  -vf "crop=ih*9/16:ih,scale=1080:1920:flags=lanczos" \
  -c:v libx264 -crf 20 -preset medium -profile:v high -pix_fmt yuv420p \
  -c:a aac -b:a 128k -ar 44100 -movflags +faststart -t 180 OUTPUT_tiktok.mp4
```

### TikTok (blur background, no crop)
```
ffmpeg -n -i INPUT -i INPUT -filter_complex \
  "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=20[bg];\
   [1:v]scale=1080:1920:force_original_aspect_ratio=decrease[fg];\
   [bg][fg]overlay=(W-w)/2:(H-h)/2" \
  -c:v libx264 -crf 20 -c:a aac -b:a 128k -movflags +faststart OUTPUT_tiktok.mp4
```

### Instagram Square (1:1)
```
ffmpeg -n -i INPUT \
  -vf "crop=min(iw\,ih):min(iw\,ih),scale=1080:1080:flags=lanczos" \
  -c:v libx264 -crf 20 -pix_fmt yuv420p -c:a aac -b:a 128k \
  -movflags +faststart -t 60 OUTPUT_ig_square.mp4
```

### Instagram Portrait (4:5)
```
ffmpeg -n -i INPUT \
  -vf "crop=ih*4/5:ih,scale=1080:1350:flags=lanczos" \
  -c:v libx264 -crf 20 -pix_fmt yuv420p -c:a aac -b:a 128k \
  -movflags +faststart -t 60 OUTPUT_ig_portrait.mp4
```

### LinkedIn
```
ffmpeg -n -i INPUT \
  -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black" \
  -c:v libx264 -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k \
  -movflags +faststart -fs 200M OUTPUT_linkedin.mp4
```

### Twitter/X
```
ffmpeg -n -i INPUT \
  -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:black" \
  -c:v libx264 -crf 22 -pix_fmt yuv420p -c:a aac -b:a 128k \
  -movflags +faststart -fs 512M -t 140 OUTPUT_twitter.mp4
```

### Web (WebM)
```
ffmpeg -n -i INPUT -c:v libvpx-vp9 -crf 30 -b:v 0 -row-mt 1 \
  -c:a libopus -b:a 128k OUTPUT_web.webm
```

### Podcast (audio-only)
```
ffmpeg -n -i INPUT -vn -af "loudnorm=I=-16:TP=-1.5:LRA=11" \
  -c:a aac -b:a 128k -ar 44100 OUTPUT_podcast.m4a
```

### High-Quality GIF
```
ffmpeg -n -ss 5 -t 3 -i INPUT \
  -vf "fps=15,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
  OUTPUT.gif
```
