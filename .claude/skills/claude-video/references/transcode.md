# Transcoding Reference

## Codec Comparison

| Codec | Encoder (CPU) | Encoder (GPU) | CRF Range | Recommended CRF | Speed |
|-------|--------------|---------------|-----------|-----------------|-------|
| H.264 | libx264 | h264_nvenc | 0-51 | 18-23 | Fast |
| H.265/HEVC | libx265 | hevc_nvenc | 0-51 | 22-28 | Medium |
| AV1 | libsvtav1 | av1_nvenc | 1-63 | 24-30 | Slow (CPU) / Fast (GPU) |
| VP9 | libvpx-vp9 | N/A | 0-63 | 25-35 | Slow |
| ProRes | prores_ks | N/A | N/A | Profile 3 (HQ) | Fast (large files) |
| DNxHR | dnxhd | N/A | N/A | dnxhr_hq | Fast (large files) |

## CRF Equivalence

x264 CRF 23 ≈ x265 CRF 28 ≈ SVT-AV1 CRF 30 (similar visual quality, decreasing file size).
Each ±6 CRF roughly doubles or halves the bitrate.

## CPU Speed Presets

libx264/libx265: ultrafast, superfast, veryfast, faster, fast, medium, slow, slower, veryslow
- **medium** is the default — good balance
- **slow** gives ~5-10% better compression for ~40% more time
- **veryslow** gives ~10-15% better compression for ~3x more time
- Never use ultrafast for final delivery

libsvtav1: presets 0-13 (0=slowest/best, 13=fastest)
- **preset 6** is good for general use
- **preset 4** for quality priority
- **preset 8** for speed priority

## NVENC Presets

p1 (fastest) through p7 (best quality). **p4-p5** is the sweet spot.
NVENC `-cq` flag is equivalent to CRF. Lower = better quality.
Always add `-spatial-aq 1 -temporal-aq 1 -rc-lookahead 32` for quality.

## Two-Pass Encoding

Used when targeting a specific file size or bitrate:
```
Pass 1: ffmpeg -y -i input -c:v libx264 -b:v 5M -pass 1 -passlogfile /tmp/2pass -an -f null /dev/null
Pass 2: ffmpeg -n -i input -c:v libx264 -b:v 5M -pass 2 -passlogfile /tmp/2pass -c:a aac output.mp4
```

Target bitrate formula: `bitrate = target_size_bits / duration_seconds`

## Container Compatibility

| Container | Video Codecs | Audio Codecs | Key Flag |
|-----------|-------------|-------------|----------|
| MP4 | H.264, H.265, AV1 | AAC, AC3, MP3 | `-movflags +faststart` |
| MKV | Everything | Everything | Most flexible |
| WebM | VP8, VP9, AV1 | Vorbis, Opus | Web-optimized |
| MOV | ProRes, H.264, H.265 | AAC, PCM | Apple workflows |

## Essential Flags

- `-movflags +faststart` — ALWAYS for MP4 (moves metadata for streaming)
- `-pix_fmt yuv420p` — Maximum compatibility
- `-pix_fmt yuv420p10le` — 10-bit (AV1, HDR)
- `-tag:v hvc1` — Required for H.265 on Apple devices
- `-profile:v high -level 4.1` — H.264 compatibility profile
- `-c copy` — Stream copy (no re-encode, instant)
- `-n` — Never overwrite existing output
